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
use Illuminate\Validation\ValidationException;
use Throwable;

class LoginController extends Controller
{
    private const OTP_TTL_SECONDS = 120;
    private const OTP_RESEND_AFTER_SECONDS = 60;
    private const OTP_MAX_ATTEMPTS = 5;

    /**
     * Send a login-only OTP after confirming that an active account exists.
     *
     * @throws ValidationException
     */
    public function sendOtp(Request $request, OtpSender $otpSender): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
        ], [
            'phone.required' => 'شماره موبایل الزامی است.',
            'phone.regex' => 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
        ]);

        $user = User::query()
            ->where('phone', $data['phone'])
            ->where('status', 'active')
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'حساب فعالی با این شماره موبایل یافت نشد. لطفاً ابتدا ثبت‌نام کنید.',
            ]);
        }

        if (! Cache::add(
            $this->resendCacheKey($data['phone']),
            true,
            self::OTP_RESEND_AFTER_SECONDS,
        )) {
            return response()->json([
                'message' => 'لطفاً کمی صبر کنید و سپس دوباره درخواست کد تأیید بدهید.',
                'retry_after' => self::OTP_RESEND_AFTER_SECONDS,
            ], 429);
        }

        $otp = (string) random_int(100000, 999999);

        Cache::put($this->otpCacheKey($data['phone']), [
            'user_id' => $user->id,
            'phone' => $data['phone'],
            'otp_hash' => Hash::make($otp),
            'attempts' => 0,
            'expires_at' => now()->addSeconds(self::OTP_TTL_SECONDS)->timestamp,
        ], self::OTP_TTL_SECONDS);

        try {
            $otpSender->send($data['phone'], $otp);
        } catch (Throwable $exception) {
            Cache::forget($this->otpCacheKey($data['phone']));
            Cache::forget($this->resendCacheKey($data['phone']));
            report($exception);

            return response()->json([
                'message' => 'ارسال کد ورود ناموفق بود. لطفاً دوباره تلاش کنید.',
            ], 503);
        }

        $response = [
            'message' => 'کد ورود ارسال شد.',
            'expires_in' => self::OTP_TTL_SECONDS,
            'resend_after' => self::OTP_RESEND_AFTER_SECONDS,
        ];

        if (app()->environment('testing')) {
            $response['debug_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * Verify the login-only OTP and issue a Sanctum token.
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

        if (! Hash::check($data['otp'], $otpData['otp_hash'])) {
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

        $user = User::query()
            ->whereKey($otpData['user_id'])
            ->where('phone', $data['phone'])
            ->where('status', 'active')
            ->first();

        if (! $user) {
            Cache::forget($cacheKey);

            throw ValidationException::withMessages([
                'phone' => 'حساب فعالی با این شماره موبایل یافت نشد.',
            ]);
        }

        Cache::forget($cacheKey);

        return $this->authenticatedResponse(
            $user,
            $data['device_name'] ?? 'web',
        );
    }

    /**
     * Authenticate with phone + password and issue a Sanctum token.
     *
     * @throws ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'password' => ['required', 'string'],
            'device_name' => ['sometimes', 'string', 'max:100'],
        ], [
            'phone.required' => 'شماره موبایل الزامی است.',
            'phone.regex' => 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
            'password.required' => 'رمز عبور الزامی است.',
        ]);

        $user = User::query()
            ->where('phone', $data['phone'])
            ->first();

        if (
            ! $user
            || $user->status !== 'active'
            || ! Hash::check($data['password'], $user->password)
        ) {
            throw ValidationException::withMessages([
                'phone' => 'شماره موبایل یا رمز عبور اشتباه است.',
            ]);
        }

        return $this->authenticatedResponse(
            $user,
            $data['device_name'] ?? 'web',
        );
    }

    /**
     * Revoke the current access token.
     */
    public function destroy(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'message' => 'خروج با موفقیت انجام شد.',
        ]);
    }

    private function authenticatedResponse(User $user, string $deviceName): JsonResponse
    {
        $user->forceFill(['last_login_at' => now()])->save();
        $user->load(['roles:id,code,name', 'clientProfile', 'lawyerProfile']);

        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'message' => 'ورود با موفقیت انجام شد.',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => AuthenticatedUserResource::make($user)->resolve(),
        ]);
    }

    private function otpCacheKey(string $phone): string
    {
        return 'login:otp:'.hash('sha256', $phone);
    }

    private function resendCacheKey(string $phone): string
    {
        return 'login:resend:'.hash('sha256', $phone);
    }
}
