<?php

namespace App\Http\Controllers\Api\Auth;

use App\Contracts\OtpSender;
use App\Http\Controllers\Controller;
use App\Http\Resources\AuthenticatedUserResource;
use App\Models\ClientProfile;
use App\Models\LawyerProfile;
use App\Models\Policy;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Models\UserPolicyAcceptance;
use App\Exceptions\LawyerRegistryUnavailableException;
use App\Services\Lawyers\LawyerRegistryVerificationException;
use App\Services\Lawyers\LawyerRegistryVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Throwable;

class RegisterController extends Controller
{
    private const OTP_TTL_SECONDS = 120;
    private const OTP_RESEND_AFTER_SECONDS = 60;
    private const OTP_MAX_ATTEMPTS = 5;
    private const VERIFICATION_TTL_SECONDS = 600;

    public function sendOtp(Request $request, OtpSender $otpSender): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
        ]);

        if (User::query()->where('phone', $data['phone'])->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'این شماره موبایل قبلاً ثبت‌نام شده است.',
            ]);
        }

        if (!Cache::add(
            $this->resendCacheKey($data['phone']),
            true,
            self::OTP_RESEND_AFTER_SECONDS,
        )) {
            return response()->json([
                'message' => 'لطفاً کمی صبر کنید و سپس دوباره درخواست کد تأیید بدهید.',
                'retry_after' => self::OTP_RESEND_AFTER_SECONDS,
            ], 429);
        }

        $otp = (string)random_int(100000, 999999);

        Cache::put($this->otpCacheKey($data['phone']), [
            'otp_hash' => hash('sha256', $otp),
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
                'message' => 'ارسال کد تأیید ناموفق بود. لطفاً دوباره تلاش کنید.',
            ], 503);
        }

        $response = [
            'message' => 'کد تأیید ارسال شد.',
            'expires_in' => self::OTP_TTL_SECONDS,
            'resend_after' => self::OTP_RESEND_AFTER_SECONDS,
        ];

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
        ]);

        $cacheKey = $this->otpCacheKey($data['phone']);
        $otpData = Cache::get($cacheKey);

        if (!is_array($otpData) || ($otpData['expires_at'] ?? 0) <= now()->timestamp) {
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
                    ? 'تعداد تلاش‌های مجاز به پایان رسیده است. لطفاً کد جدید درخواست کنید.'
                    : 'کد تأیید نامعتبر است یا منقضی شده است.',
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
            'message' => 'شماره موبایل با موفقیت تأیید شد.',
            'verification_token' => $verificationToken,
            'expires_in' => self::VERIFICATION_TTL_SECONDS,
        ]);
    }

    /** @throws ValidationException */
    public function validateLawyer(Request $request, LawyerRegistryVerifier $registryVerifier,): JsonResponse {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'license_number' => ['required', 'string', 'max:30'],
            'verification_token' => ['required', 'string', 'size:64'],
        ]);

        $verifiedPhone = Cache::get(
            $this->verificationCacheKey($data['verification_token']),
        );

        if (! is_string($verifiedPhone) || ! hash_equals($verifiedPhone, $data['phone'])) {
            throw ValidationException::withMessages([
                'verification_token' => 'اعتبارسنجی شماره موبایل نامعتبر است یا منقضی شده است. لطفاً دوباره کد تأیید دریافت کنید.',
            ]);
        }

        try {
            $match = $registryVerifier->verify(
                $data['license_number'],
                $verifiedPhone,
                $data['first_name'].' '.$data['last_name'],
            );
        } catch (LawyerRegistryVerificationException $exception) {
            throw ValidationException::withMessages([
                $exception->field => $exception->getMessage(),
            ]);
        } catch (LawyerRegistryUnavailableException $exception) {
            report($exception);

            return response()->json([
                'message' => 'سرویس اعتبارسنجی وکیل موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.',
            ], 503);
        }

        return response()->json([
            'message' => 'اطلاعات وکیل با موفقیت با مرجع اعتبارسنجی تطبیق داده شد.',
            'lawyer' => [
                'license_number' => $match['license_number'],
                'full_name' => $match['full_name'],
            ],
        ]);
    }

    /** @throws ValidationException */
    public function store(Request $request, LawyerRegistryVerifier $registryVerifier,): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['client', 'lawyer'])],
            'license_number' => [
                Rule::requiredIf(fn (): bool => $request->input('role') === 'lawyer'),
                'nullable',
                'string',
                'max:30',
            ],
            'terms_accepted' => ['accepted'],
            'verification_token' => ['required', 'string', 'size:64'],
        ]);

        $verifiedPhone = Cache::get(
            $this->verificationCacheKey($data['verification_token']),
        );

        if (!is_string($verifiedPhone) || !hash_equals($verifiedPhone, $data['phone'])) {
            throw ValidationException::withMessages([
                'verification_token' => 'اعتبارسنجی شماره موبایل نامعتبر است یا منقضی شده است. لطفاً دوباره کد تأیید دریافت کنید.',
            ]);
        }

        if (User::query()->where('phone', $data['phone'])->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'این شماره موبایل قبلاً ثبت‌نام شده است.',
            ]);
        }

        $registryMatch = null;

        if ($data['role'] === 'lawyer') {
            try {
                $registryMatch = $registryVerifier->verify(
                    $data['license_number'],
                    $verifiedPhone,
                    $data['first_name'].' '.$data['last_name'],
                );
            } catch (LawyerRegistryVerificationException $exception) {
                throw ValidationException::withMessages([
                    $exception->field => $exception->getMessage(),
                ]);
            } catch (LawyerRegistryUnavailableException $exception) {
                report($exception);

                return response()->json([
                    'message' => 'سرویس اعتبارسنجی وکیل موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.',
                ], 503);
            }
        }

        $user = DB::transaction(function () use ($data, $registryMatch, $request): User {
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
                [
                    'name' => $data['role'] === 'lawyer' ? 'Lawyer' : 'Client',
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
                $profile = LawyerProfile::query()->create([
                    'user_id' => $user->id,
                    'full_name' => $fullName,
                    'license_number' => $registryMatch['license_number'],
                    'verification_status' => 'approved',
                ]);

                $profile->verifications()->create([
                    'status' => 'approved',
                    'submitted_data' => [
                        'license_number' => $registryMatch['license_number'],
                        'registry_full_name' => $registryMatch['full_name'],
                        'organization' => $registryMatch['organization'],
                        'registry_source_hash' => $registryMatch['source_hash'],
                    ],
                    'review_note' => 'اطلاعات به‌صورت خودکار با مرجع اعتبارسنجی وکلا تطبیق داده شد.',
                    'submitted_at' => now(),
                    'reviewed_at' => now(),
                ]);
            } else {
                ClientProfile::query()->create([
                    'user_id' => $user->id,
                    'full_name' => $fullName,
                ]);
            }

            $currentTerms = Policy::currentOfType('terms_of_service');

            if ($currentTerms !== null) {
                UserPolicyAcceptance::query()->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'policy_id' => $currentTerms->id,
                    ],
                    [
                        'accepted_at' => now(),
                        'ip_address' => $request->ip(),
                        'user_agent' => mb_substr((string) $request->userAgent(), 0, 255),
                    ],
                );
            }

            return $user;
        });

        Cache::forget($this->verificationCacheKey($data['verification_token']));

        $token = $user->createToken('registration')->plainTextToken;
        $user->load(['roles:id,code,name', 'clientProfile', 'lawyerProfile']);

        return response()->json([
            'message' => 'ثبت‌نام با موفقیت انجام شد.',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => AuthenticatedUserResource::make($user)->resolve(),
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
