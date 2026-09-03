'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { Scale, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { storeAuthSession } from '@/lib/api/client';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_KEY = 'vakilam_registration_draft';
const OTP_RESEND_SECONDS = 60;

const initialProfile = {
    first_name: '',
    last_name: '',
    role: '',
    license_number: '',
};

const roles = [
    {
        id: 'client',
        title: 'موکل',
        description: 'ثبت مسئله، انتخاب وکیل و مدیریت همکاری',
        icon: UserRound,
    },
    {
        id: 'lawyer',
        title: 'وکیل',
        description: 'احراز هویت، دریافت درخواست و مدیریت همکاری',
        icon: Scale,
    },
];

const normalizeDigits = (value) =>
    value
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const firstApiError = (payload, fallback) => {
    const validationError = payload?.errors
        ? Object.values(payload.errors).flat().find(Boolean)
        : null;

    return validationError || payload?.message || fallback;
};

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers,
        },
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            firstApiError(payload, 'ارتباط با سرور ناموفق بود.'),
        );
        error.status = response.status;
        throw error;
    }

    return payload;
}

function Field({ label, ...props }) {
    return (
        <div>
            <label
                htmlFor={props.id}
                className="mb-2 block text-[13px] font-bold text-[#123c35]"
            >
                {label}
            </label>
            <input
                {...props}
                className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
            />
        </div>
    );
}

export default function RegisterUi() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [profile, setProfile] = useState(initialProfile);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [otpSentAt, setOtpSentAt] = useState(0);
    const [clock, setClock] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [restored, setRestored] = useState(false);

    useEffect(() => {
        const restoreTimer = window.setTimeout(() => {
            try {
                const saved = JSON.parse(
                    sessionStorage.getItem(STORAGE_KEY) || 'null',
                );

                if (saved && typeof saved === 'object') {
                    setStep(Number.isInteger(saved.step) ? saved.step : 0);
                    setPhone(saved.phone || '');
                    setVerificationToken(saved.verificationToken || '');
                    setProfile({ ...initialProfile, ...saved.profile });
                    setOtpSentAt(saved.otpSentAt || 0);
                }
            } catch {
                sessionStorage.removeItem(STORAGE_KEY);
            } finally {
                setRestored(true);
            }
        }, 0);

        return () => window.clearTimeout(restoreTimer);
    }, []);

    useEffect(() => {
        if (!restored) return;

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                step,
                phone,
                verificationToken,
                profile,
                otpSentAt,
            }),
        );
    }, [otpSentAt, phone, profile, restored, step, verificationToken]);

    useEffect(() => {
        if (step !== 1) return undefined;

        const timer = window.setInterval(() => setClock(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [step]);

    const resendRemaining = useMemo(
        () =>
            otpSentAt
                ? Math.max(
                      0,
                      OTP_RESEND_SECONDS -
                          Math.floor((clock - otpSentAt) / 1000),
                  )
                : 0,
        [clock, otpSentAt],
    );

    const clearMessages = () => {
        setError('');
        setNotice('');
    };

    const sendOtp = async (isResend = false) => {
        const normalizedPhone = normalizeDigits(phone).replace(/\D/g, '');

        if (!/^09\d{9}$/.test(normalizedPhone)) {
            setError('شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد.');
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            await request('/auth/register/send-otp', {
                method: 'POST',
                body: JSON.stringify({ phone: normalizedPhone }),
            });
            setPhone(normalizedPhone);
            setOtp('');
            setOtpSentAt(Date.now());
            setClock(Date.now());
            setStep(1);
            setNotice(
                isResend
                    ? 'کد تأیید دوباره ارسال شد.'
                    : 'کد تأیید ارسال شد.',
            );
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneSubmit = async (event) => {
        event.preventDefault();
        await sendOtp();
    };

    const handleOtpSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const payload = await request('/auth/register/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ phone, otp }),
            });
            setVerificationToken(payload.verification_token);
            setOtp('');
            setStep(2);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = (event) => {
        const { name, value } = event.target;
        setProfile((current) => ({ ...current, [name]: value }));
        setError('');
    };

    const handleProfileSubmit = (event) => {
        event.preventDefault();
        clearMessages();

        if (!profile.role) {
            setError('نقش خود را انتخاب کنید.');
            return;
        }

        if (profile.role === 'lawyer' && !profile.license_number.trim()) {
            setError('شماره پروانه وکالت را وارد کنید.');
            return;
        }

        setStep(3);
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        clearMessages();

        if (password.length < 8) {
            setError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('رمز عبور و تکرار آن یکسان نیستند.');
            return;
        }

        if (!termsAccepted) {
            setError('پذیرش قوانین و شرایط استفاده الزامی است.');
            return;
        }

        setLoading(true);

        try {
            const payload = await request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    first_name: profile.first_name.trim(),
                    last_name: profile.last_name.trim(),
                    phone,
                    role: profile.role,
                    ...(profile.role === 'lawyer'
                        ? { license_number: profile.license_number.trim() }
                        : {}),
                    password,
                    password_confirmation: passwordConfirmation,
                    terms_accepted: true,
                    verification_token: verificationToken,
                }),
            });

            storeAuthSession(payload);
            sessionStorage.removeItem(STORAGE_KEY);
            router.replace(profile.role === 'lawyer' ? '/lawyer' : '/client');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep(0);
        setPhone('');
        setOtp('');
        setVerificationToken('');
        setProfile(initialProfile);
        setPassword('');
        setPasswordConfirmation('');
        setTermsAccepted(false);
        setOtpSentAt(0);
        clearMessages();
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const titles = [
        'شماره موبایل',
        'تأیید شماره موبایل',
        'اطلاعات اولیه',
        'ایجاد رمز عبور',
    ];

    return (
        <div
            dir="rtl"
            className={`${vazir.className} w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-7 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9`}
        >
            <header className="text-center">
                <h1 className="text-[22px] font-extrabold leading-9 text-[#123c35] sm:text-[25px]">
                    ایجاد حساب کاربری
                </h1>
                <p className="mt-2 text-[13px] font-medium text-[#7c8985]">
                    {titles[step]}
                </p>
            </header>

            <div className="mt-5 grid grid-cols-4 gap-2" aria-label="مراحل ثبت‌نام">
                {titles.map((title, index) => (
                    <div key={title} className="text-center">
                        <div
                            className={`h-1.5 rounded-full ${index <= step ? 'bg-[#123c35]' : 'bg-[#dfe7e4]'}`}
                        />
                        <span className="sr-only">{title}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-center text-[12px] font-medium leading-6 text-red-600">
                    {error}
                </div>
            )}
            {notice && (
                <div className="mt-5 rounded-[12px] bg-emerald-50 px-4 py-3 text-center text-[12px] font-medium leading-6 text-emerald-700">
                    {notice}
                </div>
            )}

            {step === 0 && (
                <form onSubmit={handlePhoneSubmit} className="mt-7 space-y-5">
                    <p className="text-center text-[13px] leading-7 text-[#7c8985]">
                        برای شروع ثبت‌نام، شماره موبایل خود را وارد کنید.
                    </p>
                    <Field
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        label="شماره موبایل"
                        value={phone}
                        onChange={(event) => {
                            setPhone(
                                normalizeDigits(event.target.value)
                                    .replace(/\D/g, '')
                                    .slice(0, 11),
                            );
                            setError('');
                        }}
                        placeholder="مثلاً 09123456789"
                        autoComplete="tel"
                        maxLength={11}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
                    </button>
                </form>
            )}

            {step === 1 && (
                <form onSubmit={handleOtpSubmit} className="mt-7 space-y-5">
                    <p className="text-center text-[13px] leading-7 text-[#7c8985]">
                        کد ۶ رقمی ارسال‌شده به{' '}
                        <strong className="text-[#123c35]">{phone}</strong> را وارد کنید.
                    </p>
                    <Field
                        id="otp"
                        name="otp"
                        label="کد تأیید"
                        value={otp}
                        onChange={(event) => {
                            setOtp(
                                normalizeDigits(event.target.value)
                                    .replace(/\D/g, '')
                                    .slice(0, 6),
                            );
                            setError('');
                        }}
                        placeholder="کد ۶ رقمی"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'در حال بررسی...' : 'تأیید کد'}
                    </button>
                    <button
                        type="button"
                        onClick={() => sendOtp(true)}
                        disabled={loading || resendRemaining > 0}
                        className="w-full text-[12px] font-bold text-[#c9a96e] disabled:text-[#a0aaa7]"
                    >
                        {resendRemaining
                            ? `ارسال مجدد تا ${resendRemaining} ثانیه دیگر`
                            : 'ارسال مجدد کد'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setStep(0);
                            setOtp('');
                            clearMessages();
                        }}
                        disabled={loading}
                        className="w-full text-[12px] font-bold text-[#7c8985] hover:text-[#123c35]"
                    >
                        اصلاح شماره موبایل
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleProfileSubmit} className="mt-7 space-y-5">
                    <Field
                        id="first_name"
                        name="first_name"
                        label="نام"
                        value={profile.first_name}
                        onChange={updateProfile}
                        placeholder="نام خود را وارد کنید"
                        autoComplete="given-name"
                        required
                    />
                    <Field
                        id="last_name"
                        name="last_name"
                        label="نام خانوادگی"
                        value={profile.last_name}
                        onChange={updateProfile}
                        placeholder="نام خانوادگی خود را وارد کنید"
                        autoComplete="family-name"
                        required
                    />
                    <div>
                        <span className="mb-2 block text-[13px] font-bold text-[#123c35]">
                            نقش کاربری
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map((role) => {
                                const Icon = role.icon;
                                const selected = profile.role === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => {
                                            setProfile((current) => ({
                                                ...current,
                                                role: role.id,
                                                license_number:
                                                    role.id === 'lawyer'
                                                        ? current.license_number
                                                        : '',
                                            }));
                                            setError('');
                                        }}
                                        className={`rounded-[13px] border p-4 text-center transition ${selected ? 'border-[#123c35] bg-[#f1f7f5]' : 'border-[#dfe7e4] bg-white'}`}
                                    >
                                        <Icon
                                            className="mx-auto text-[#123c35]"
                                            size={24}
                                        />
                                        <strong className="mt-2 block text-[13px] text-[#123c35]">
                                            {role.title}
                                        </strong>
                                        <span className="mt-1 block text-[10px] leading-5 text-[#7c8985]">
                                            {role.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {profile.role === 'lawyer' && (
                        <Field
                            id="license_number"
                            name="license_number"
                            label="شماره پروانه وکالت"
                            value={profile.license_number}
                            onChange={updateProfile}
                            placeholder="شماره پروانه را وارد کنید"
                            required
                        />
                    )}
                    <button
                        type="submit"
                        className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a]"
                    >
                        ادامه
                    </button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleRegister} className="mt-7 space-y-5">
                    <Field
                        id="password"
                        type="password"
                        label="رمز عبور"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError('');
                        }}
                        placeholder="حداقل ۸ کاراکتر"
                        autoComplete="new-password"
                        required
                    />
                    <Field
                        id="password_confirmation"
                        type="password"
                        label="تکرار رمز عبور"
                        value={passwordConfirmation}
                        onChange={(event) => {
                            setPasswordConfirmation(event.target.value);
                            setError('');
                        }}
                        placeholder="رمز عبور را دوباره وارد کنید"
                        autoComplete="new-password"
                        required
                    />
                    <label className="flex cursor-pointer items-start gap-3 rounded-[12px] bg-[#f8faf9] p-4 text-[12px] leading-6 text-[#53635f]">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(event) => {
                                setTermsAccepted(event.target.checked);
                                setError('');
                            }}
                            className="mt-1 h-4 w-4 accent-[#123c35]"
                        />
                        قوانین و شرایط استفاده از وکیلم را مطالعه کرده‌ام و می‌پذیرم.
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'در حال ساخت حساب...' : 'تکمیل ثبت‌نام'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setStep(2);
                            setPassword('');
                            setPasswordConfirmation('');
                            clearMessages();
                        }}
                        disabled={loading}
                        className="w-full text-[12px] font-bold text-[#7c8985] hover:text-[#123c35]"
                    >
                        ویرایش اطلاعات اولیه
                    </button>
                </form>
            )}

            <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-6 w-full text-center text-[12px] font-bold text-[#c9a96e] hover:underline"
            >
                قبلاً ثبت‌نام کرده‌اید؟ ورود
            </button>

            {step > 0 && (
                <button
                    type="button"
                    onClick={resetFlow}
                    disabled={loading}
                    className="mt-3 w-full text-center text-[11px] font-medium text-[#9aa5a1] hover:text-red-500"
                >
                    شروع دوباره ثبت‌نام
                </button>
            )}
        </div>
    );
}
