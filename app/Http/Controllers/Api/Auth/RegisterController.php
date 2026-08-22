<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\ClientProfile;
use App\Models\LawyerProfile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    private const OTP_TTL_SECONDS = 120;

    private const OTP_RESEND_AFTER_SECONDS = 60;

    private const OTP_MAX_ATTEMPTS = 5;

    private const VERIFICATION_TTL_SECONDS = 600;

    public function sendOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
        ]);

        if (User::query()->where('phone', $data['phone'])->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'This phone number is already registered.',
            ]);
        }

        if (!Cache::add(
            $this->resendCacheKey($data['phone']),
            true,
            self::OTP_RESEND_AFTER_SECONDS,
        )) {
            return response()->json([
                'message' => 'Please wait before requesting another code.',
                'retry_after' => self::OTP_RESEND_AFTER_SECONDS,
            ], 429);
        }

        $otp = (string)random_int(100000, 999999);

        Cache::put($this->otpCacheKey($data['phone']), [
            'otp_hash' => hash('sha256', $otp),
            'attempts' => 0,
            'expires_at' => now()->addSeconds(self::OTP_TTL_SECONDS)->timestamp,
        ], self::OTP_TTL_SECONDS);

        $response = [
            'message' => 'Verification code generated.',
            'expires_in' => self::OTP_TTL_SECONDS,
            'resend_after' => self::OTP_RESEND_AFTER_SECONDS,
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
        ]);

        $cacheKey = $this->otpCacheKey($data['phone']);
        $otpData = Cache::get($cacheKey);

        if (!is_array($otpData) || ($otpData['expires_at'] ?? 0) <= now()->timestamp) {
            Cache::forget($cacheKey);

            throw ValidationException::withMessages([
                'otp' => 'The verification code is invalid or has expired.',
            ]);
        }

        if (($otpData['attempts'] ?? 0) >= self::OTP_MAX_ATTEMPTS) {
            Cache::forget($cacheKey);

            throw ValidationException::withMessages([
                'otp' => 'The maximum number of attempts has been reached. Request a new code.',
            ]);
        }

        if (!hash_equals((string)$otpData['otp_hash'], hash('sha256', $data['otp']))) {
            $otpData['attempts']++;
            $remainingSeconds = max(1, $otpData['expires_at'] - now()->timestamp);

            if ($otpData['attempts'] >= self::OTP_MAX_ATTEMPTS) {
                Cache::forget($cacheKey);
            } else {
                Cache::put($cacheKey, $otpData, $remainingSeconds);
            }

            throw ValidationException::withMessages([
                'otp' => $otpData['attempts'] >= self::OTP_MAX_ATTEMPTS
                    ? 'The maximum number of attempts has been reached. Request a new code.'
                    : 'The verification code is invalid or has expired.',
            ]);
        }

        Cache::forget($cacheKey);

        $verificationToken = Str::random(64);

        Cache::put(
            $this->verificationCacheKey($verificationToken),
            $data['phone'],
            self::VERIFICATION_TTL_SECONDS,
        );

        return response()->json([
            'message' => 'Phone number verified.',
            'verification_token' => $verificationToken,
            'expires_in' => self::VERIFICATION_TTL_SECONDS,
        ]);
    }

    /** @throws ValidationException */
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
        ]);

        $verifiedPhone = Cache::get(
            $this->verificationCacheKey($data['verification_token']),
        );

        if (!is_string($verifiedPhone) || !hash_equals($verifiedPhone, $data['phone'])) {
            throw ValidationException::withMessages([
                'verification_token' => 'The phone verification is invalid or has expired.',
            ]);
        }

        if (User::query()->where('phone', $data['phone'])->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'This phone number is already registered.',
            ]);
        }

        $user = DB::transaction(function () use ($data): User {
            $user = User::query()->create([
                'name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'],
                'password' => $data['password'],
            ]);

            $user->forceFill([
                'phone_verified_at' => now(),
                'status' => 'active',
            ])->save();

            $role = Role::query()->firstOrCreate(
                ['code' => $data['role']],

                ['name' => $data['role'] === 'lawyer' ? 'Lawyer' : 'Client'],

                [
                    'name' => $data['role'] === 'lawyer' ? 'وکیل' : 'موکل',
                    'is_system' => true,
                ],

            );

            UserRole::query()->create([
                'user_id' => $user->id,
                'role_id' => $role->id,
                'granted_at' => now(),
            ]);

            $fullName = $data['first_name'] . ' ' . $data['last_name'];

            if ($data['role'] === 'lawyer') {
                LawyerProfile::query()->create([
                    'user_id' => $user->id,
                    'full_name' => $fullName,
                    'verification_status' => 'pending',
                ]);
            } else {
                ClientProfile::query()->create([
                    'user_id' => $user->id,
                    'full_name' => $fullName,
                ]);
            }

            return $user;
        });

        Cache::forget($this->verificationCacheKey($data['verification_token']));

        $token = $user->createToken('registration')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully.',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'last_name' => $user->last_name,
                'phone' => $user->phone,
                'role' => $data['role'],
                'status' => $user->status,
            ],
        ], 201);
    }

    private function otpCacheKey(string $phone): string
    {
        return "registration:otp:{$phone}";
    }

    private function resendCacheKey(string $phone): string
    {
        return 'registration:resend:' . hash('sha256', $phone);
    }

    private function verificationCacheKey(string $token): string
    {
        return 'registration:verified:' . hash('sha256', $token);
    }
}
