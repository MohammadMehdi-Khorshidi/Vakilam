<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

use Illuminate\Validation\Rule;


use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    private const OTP_TTL_SECONDS = 120;

    private const VERIFICATION_TTL_SECONDS = 600;

    public function sendOtp(Request $request): JsonResponse
    {
        $data = $request->validate([

            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],

            'phone' => 'required|string|regex:/^09\d{9}$/',

        ]);

        $otp = (string) random_int(100000, 999999);

        Cache::put($this->otpCacheKey($data['phone']), $otp, self::OTP_TTL_SECONDS);

        $response = [
            'message' => 'کد تأیید ساخته شد.',
            'expires_in' => self::OTP_TTL_SECONDS,
            'resend_after' => 60,
        ];

        // تا قبل از اتصال سرویس پیامک، کد فقط در محیط توسعه و تست برگردانده می‌شود.
        if (app()->environment(['local', 'testing'])) {
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

            'phone' => 'required|string|regex:/^09\d{9}$/',
            'otp' => 'required|string|digits:6',

        ]);

        $expectedOtp = Cache::get($this->otpCacheKey($data['phone']));

        if (! is_string($expectedOtp) || ! hash_equals($expectedOtp, $data['otp'])) {
            throw ValidationException::withMessages([
                'otp' => 'کد تأیید نامعتبر یا منقضی شده است.',
            ]);
        }

        Cache::forget($this->otpCacheKey($data['phone']));

        $verificationToken = Str::random(64);

        Cache::put(
            $this->verificationCacheKey($verificationToken),
            $data['phone'],
            self::VERIFICATION_TTL_SECONDS,
        );

        return response()->json([
            'message' => 'شماره موبایل تأیید شد.',
            'verification_token' => $verificationToken,
            'expires_in' => self::VERIFICATION_TTL_SECONDS,
        ]);
    }

    /**
     * Validate the final registration payload.
     *
     * User creation will be added here after the user schema and role model are finalized.
     *
     * @throws ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['client', 'lawyer'])],
            'terms_accepted' => ['accepted'],
            'verification_token' => ['required', 'string', 'size:64'],

            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'required|string|regex:/^09\d{9}$/',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:client,lawyer',
            'terms_accepted' => 'accepted',
            'verification_token' => 'required|string|size:64',

        ]);

        $verifiedPhone = Cache::get(
            $this->verificationCacheKey($data['verification_token']),
        );

        if (! is_string($verifiedPhone) || ! hash_equals($verifiedPhone, $data['phone'])) {
            throw ValidationException::withMessages([
                'verification_token' => 'تأیید شماره موبایل نامعتبر یا منقضی شده است.',
            ]);
        }

        // TODO: پس از نهایی‌شدن migration و مدل User، کاربر اینجا داخل transaction ساخته شود.
        return response()->json([
            'message' => 'اطلاعات معتبر است؛ ذخیره کاربر هنوز پیاده‌سازی نشده است.',
            'ready_for_persistence' => false,
        ], 501);
    }

    private function otpCacheKey(string $phone): string
    {
        return "registration:otp:{$phone}";
    }

    private function verificationCacheKey(string $token): string
    {
        return 'registration:verified:'.hash('sha256', $token);
    }
}
