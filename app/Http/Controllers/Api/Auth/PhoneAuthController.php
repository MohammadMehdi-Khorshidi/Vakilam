<?php

namespace App\Http\Controllers\Api\Auth;

use App\Contracts\OtpSender;
use App\Http\Controllers\Controller;
use App\Http\Resources\AuthenticatedUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class PhoneAuthController extends Controller
{
    private const OTP_TTL_SECONDS = 120;

    private const OTP_RESEND_AFTER_SECONDS = 60;

    private const OTP_MAX_ATTEMPTS = 5;

    private const REGISTRATION_VERIFICATION_TTL_SECONDS = 600;

    /**
     * Send one generic OTP for both login and registration.
     *
     * Account existence is intentionally not disclosed before the phone owner
     * proves possession of the number.
     */
    public function sendOtp(Request $request, OtpSender $otpSender): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
        ], [
            'phone.required' => 'شماره موبایل الزامی است.',
            'phone.regex' => 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
        ]);

        $resendKey = $this->resendCacheKey($data['phone']);
        $otpKey = $this->otpCacheKey($data['phone']);
        $otp = (string) random_int(100000, 999999);

        try {
            if (! Cache::add(
                $resendKey,
                true,
                self::OTP_RESEND_AFTER_SECONDS,
            )) {
                return response()->json([
                    'message' => 'لطفاً کمی صبر کنید و سپس دوباره درخواست کد تأیید بدهید.',
                    'retry_after' => self::OTP_RESEND_AFTER_SECONDS,
                ], 429);
            }

            // No database lookup is needed while sending the code. The account
            // is intentionally resolved only after OTP verification. This also
            // keeps the first step independent from user-table availability.
            Cache::put($otpKey, [
                'phone' => $data['phone'],
                'otp_hash' => Hash::make($otp),
                'attempts' => 0,
                'expires_at' => now()->addSeconds(self::OTP_TTL_SECONDS)->timestamp,
            ], self::OTP_TTL_SECONDS);

            $otpSender->send($data['phone'], $otp);
        } catch (Throwable $exception) {
            // Cleanup must never replace the original exception with another
            // cache exception; cleanup is best-effort only.
            try {
                Cache::forget($otpKey);
                Cache::forget($resendKey);
            } catch (Throwable) {
                // The cache itself may be the failing dependency.
            }

            report($exception);

            return response()->json([
                'message' => 'سرویس ارسال کد تأیید موقتاً در دسترس نیست. لطفاً دوباره تلاش کنید.',
            ], 503);
        }

        $response = [
            'message' => 'کد تأیید ارسال شد.',
            'expires_in' => self::OTP_TTL_SECONDS,
            'resend_after' => self::OTP_RESEND_AFTER_SECONDS,
        ];

        // Local development may intentionally use NullOtpSender. Returning the
        // code only in local/testing makes the flow testable without leaking an
        // OTP from a production response.
        if (app()->environment(['local', 'testing'])) {
            $response['debug_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * Log an existing active user in, or continue a new user in the same page.
     *
     * @throws ValidationException
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'otp' => ['required', 'string', 'digits:6'],
            'device_name' => ['sometimes', 'string', 'max:100'],
        ], [
            'phone.required' => 'شماره موبایل الزامی است.',
            'phone.regex' => 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
            'otp.required' => 'کد تأیید الزامی است.',
            'otp.digits' => 'کد تأیید باید ۶ رقم باشد.',
        ]);

        $cacheKey = $this->otpCacheKey($data['phone']);
        $otpData = Cache::get($cacheKey);

        if (
            ! is_array($otpData)
            || ($otpData['phone'] ?? null) !== $data['phone']
            || ($otpData['expires_at'] ?? 0) <= now()->timestamp
        ) {
            Cache::forget($cacheKey);

            throw ValidationException::withMessages([
                'otp' => 'کد تأیید نامعتبر است یا منقضی شده است.',
            ]);
        }

        if (($otpData['attempts'] ?? 0) >= self::OTP_MAX_ATTEMPTS) {
            Cache::forget($cacheKey);

            throw ValidationException::withMessages([
                'otp' => 'تعداد تلاش‌های مجاز به پایان رسیده است. لطفاً کد جدید درخواست کنید.',
            ]);
        }

        if (! Hash::check($data['otp'], (string) $otpData['otp_hash'])) {
            $otpData['attempts']++;
            $remainingSeconds = max(1, $otpData['expires_at'] - now()->timestamp);

            if ($otpData['attempts'] >= self::OTP_MAX_ATTEMPTS) {
                Cache::forget($cacheKey);
            } else {
                Cache::put($cacheKey, $otpData, $remainingSeconds);
            }

            throw ValidationException::withMessages([
                'otp' => $otpData['attempts'] >= self::OTP_MAX_ATTEMPTS
                    ? 'تعداد تلاش‌های مجاز به پایان رسیده است. لطفاً کد جدید درخواست کنید.'
                    : 'کد تأیید نامعتبر است یا منقضی شده است.',
            ]);
        }

        Cache::forget($cacheKey);

        // Re-query by phone so a concurrent registration is handled safely.
        $user = User::query()->where('phone', $data['phone'])->first();

        if ($user !== null) {
            if ($user->status !== 'active') {
                return response()->json([
                    'message' => 'حساب کاربری شما فعال نیست. لطفاً با پشتیبانی تماس بگیرید.',
                ], 403);
            }

            return $this->authenticatedResponse(
                $user,
                $data['device_name'] ?? 'web',
            );
        }

        $verificationToken = Str::random(64);

        Cache::put(
            $this->registrationVerificationCacheKey($verificationToken),
            $data['phone'],
            self::REGISTRATION_VERIFICATION_TTL_SECONDS,
        );

        return response()->json([
            'message' => 'شماره موبایل تأیید شد. اطلاعات حساب خود را تکمیل کنید.',
            'requires_registration' => true,
            'verification_token' => $verificationToken,
            'expires_in' => self::REGISTRATION_VERIFICATION_TTL_SECONDS,
        ]);
    }

    private function authenticatedResponse(User $user, string $deviceName): JsonResponse
    {
        $user->forceFill(['last_login_at' => now()])->save();
        $user->load(['roles:id,code,name', 'clientProfile', 'lawyerProfile']);

        return response()->json([
            'message' => 'ورود با موفقیت انجام شد.',
            'requires_registration' => false,
            'token_type' => 'Bearer',
            'access_token' => $user->createToken($deviceName)->plainTextToken,
            'user' => AuthenticatedUserResource::make($user)->resolve(),
        ]);
    }

    private function otpCacheKey(string $phone): string
    {
        return 'phone-auth:otp:'.hash('sha256', $phone);
    }

    private function resendCacheKey(string $phone): string
    {
        return 'phone-auth:resend:'.hash('sha256', $phone);
    }

    private function registrationVerificationCacheKey(string $token): string
    {
        return 'registration:verified:'.hash('sha256', $token);
    }
}
