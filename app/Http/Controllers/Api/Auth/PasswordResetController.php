<?php

namespace App\Http\Controllers\Api\Auth;

use App\Contracts\OtpSender;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class PasswordResetController extends Controller
{
    private const OTP_TTL_SECONDS = 120;
    private const OTP_RESEND_AFTER_SECONDS = 60;
    private const OTP_MAX_ATTEMPTS = 5;
    private const RESET_TOKEN_TTL_SECONDS = 600;

    /**
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

        $response = [
            'message' => 'اگر حساب فعالی با این شماره موبایل وجود داشته باشد، کد بازیابی رمز ارسال شد.',
            'expires_in' => self::OTP_TTL_SECONDS,
            'resend_after' => self::OTP_RESEND_AFTER_SECONDS,
        ];

        if ($user === null) {
            return response()->json($response);
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
                'message' => 'ارسال کد بازیابی ناموفق بود. لطفاً دوباره تلاش کنید.',
            ], 503);
        }

        if (app()->environment('testing')) {
            $response['debug_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * @throws ValidationException
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'otp' => ['required', 'string', 'digits:6'],
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

        $resetToken = Str::random(64);

        Cache::put($this->resetTokenCacheKey($resetToken), [
            'user_id' => $user->id,
            'phone' => $data['phone'],
        ], self::RESET_TOKEN_TTL_SECONDS);

        return response()->json([
            'message' => 'شماره موبایل تأیید شد. رمز عبور جدید را وارد کنید.',
            'reset_token' => $resetToken,
            'expires_in' => self::RESET_TOKEN_TTL_SECONDS,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'reset_token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'string', 'confirmed', 'min:8', 'max:255'],
        ], [
            'phone.required' => 'شماره موبایل الزامی است.',
            'password.required' => 'رمز عبور الزامی است.',
            'password.confirmed' => 'تأیید رمز عبور مطابقت ندارد.',
            'password.min' => 'رمز عبور باید حداقل ۸ کاراکتر باشد.',
            'reset_token.required' => 'توکن بازیابی الزامی است.',
        ]);

        $resetTokenKey = $this->resetTokenCacheKey($data['reset_token']);
        $resetData = Cache::get($resetTokenKey);

        if (! is_array($resetData) || ($resetData['phone'] ?? null) !== $data['phone']) {
            throw ValidationException::withMessages([
                'reset_token' => 'توکن بازیابی نامعتبر است یا منقضی شده است.',
            ]);
        }

        $user = User::query()
            ->whereKey($resetData['user_id'])
            ->where('phone', $data['phone'])
            ->where('status', 'active')
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'reset_token' => 'توکن بازیابی نامعتبر است یا منقضی شده است.',
            ]);
        }

        if (Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'رمز عبور جدید باید با رمز فعلی متفاوت باشد.',
            ]);
        }

        $consumedResetData = Cache::pull($resetTokenKey);

        if (
            ! is_array($consumedResetData)
            || ($consumedResetData['user_id'] ?? null) !== $user->id
            || ($consumedResetData['phone'] ?? null) !== $data['phone']
        ) {
            throw ValidationException::withMessages([
                'reset_token' => 'توکن بازیابی قبلاً استفاده شده یا منقضی شده است.',
            ]);
        }

        DB::transaction(function () use ($data, $user): void {
            $user->forceFill([
                'password' => Hash::make($data['password']),
                'remember_token' => Str::random(60),
            ])->save();

            $user->tokens()->delete();
        });

        return response()->json([
            'message' => 'رمز عبور با موفقیت تغییر کرد. لطفاً دوباره وارد شوید.',
        ]);
    }

    private function otpCacheKey(string $phone): string
    {
        return 'password-reset:otp:'.hash('sha256', $phone);
    }

    private function resendCacheKey(string $phone): string
    {
        return 'password-reset:resend:'.hash('sha256', $phone);
    }

    private function resetTokenCacheKey(string $token): string
    {
        return 'password-reset:verified:'.hash('sha256', $token);
    }
}
