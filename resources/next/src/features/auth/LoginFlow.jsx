'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/auth/AuthLayout';
import LoginStep from '@/components/auth/LoginStep';
import OtpStep from '@/components/auth/OtpStep';
import PasswordStep from '@/components/auth/PasswordStep';
import UserInfoStep from '@/components/auth/UserInfoStep';
import {
    dashboardForUser,
    persistAuthSession,
    registerUser,
    sendPhoneAuthOtp,
    validateLawyerRegistration,
    verifyPhoneAuthOtp,
} from '@/lib/api/auth';

const emptyForm = {
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: '',
    licenseNumber: '',
};

export default function LoginFlow() {
    const router = useRouter();
    const [step, setStep] = useState('phone');
    const [form, setForm] = useState(emptyForm);
    const [verificationToken, setVerificationToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const updateForm = (key, value) => {
        if (error) setError('');
        setForm((current) => ({ ...current, [key]: value }));
    };

    const runRequest = async (callback) => {
        setLoading(true);
        setError('');

        try {
            return await callback();
        } catch (requestError) {
            setError(requestError.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = async (normalizedPhone) => {
        updateForm('phone', normalizedPhone);

        const result = await runRequest(() =>
            sendPhoneAuthOtp(normalizedPhone),
        );
        if (result) setStep('otp');
    };

    const verifyOtp = async (code) => {
        const result = await runRequest(() =>
            verifyPhoneAuthOtp(form.phone, code),
        );
        if (!result) return;

        if (result.requires_registration) {
            if (!result.verification_token) {
                setError('توکن تأیید ثبت‌نام از سرور دریافت نشد.');
                return;
            }

            setVerificationToken(result.verification_token);
            setStep('user-info');
            return;
        }

        if (!result.access_token || !result.user) {
            setError('اطلاعات ورود از سرور دریافت نشد.');
            return;
        }

        persistAuthSession(result);
        redirectToDashboard(result.user);
    };

    const redirectToDashboard = (user) => {
        const destination = dashboardForUser(user);
        const redirectTo = new URLSearchParams(window.location.search).get(
            'redirect',
        );
        const legacyDashboardRoutes = [
            '/client/home',
            '/lawyer/home',
            '/admin/home',
        ];
        const normalizedRedirect = legacyDashboardRoutes.includes(redirectTo)
            ? destination
            : redirectTo;
        const safeRedirect =
            !normalizedRedirect?.startsWith('//') &&
            (normalizedRedirect === destination ||
                normalizedRedirect?.startsWith(`${destination}/`))
                ? normalizedRedirect
                : destination;

        router.replace(safeRedirect);
    };

    const resendOtp = async () => {
        await sendPhoneAuthOtp(form.phone);
    };

    const continueUserInfo = async (normalizedLicense) => {
        const nextForm = {
            ...form,
            licenseNumber:
                form.role === 'lawyer'
                    ? normalizedLicense
                    : form.licenseNumber,
        };

        if (form.role === 'lawyer') {
            const result = await runRequest(() =>
                validateLawyerRegistration({
                    ...nextForm,
                    verificationToken,
                }),
            );

            if (!result) return;
        }

        setForm(nextForm);
        setStep('password');
    };

    const finishRegistration = async () => {
        const result = await runRequest(() =>
            registerUser({
                ...form,
                verificationToken,
            }),
        );

        if (!result) return;

        persistAuthSession(result);
        redirectToDashboard(result.user);
    };

    const restart = () => {
        setStep('phone');
        setForm(emptyForm);
        setVerificationToken('');
        setError('');
    };

    return (
        <AuthLayout>
            {step === 'phone' && (
                <LoginStep
                    phone={form.phone}
                    setPhone={(value) => updateForm('phone', value)}
                    onSubmit={requestOtp}
                    loading={loading}
                    externalError={error}
                />
            )}

            {step === 'otp' && (
                <OtpStep
                    phone={form.phone}
                    onVerify={verifyOtp}
                    onCodeChange={() => setError('')}
                    onChangePhone={() => {
                        setError('');
                        setStep('phone');
                    }}
                    onResend={resendOtp}
                    isLogin
                    title="ورود یا ثبت‌نام"
                    loading={loading}
                    externalError={error}
                />
            )}

            {step === 'user-info' && (
                <UserInfoStep
                    firstName={form.firstName}
                    setFirstName={(value) => updateForm('firstName', value)}
                    lastName={form.lastName}
                    setLastName={(value) => updateForm('lastName', value)}
                    role={form.role}
                    setRole={(value) => updateForm('role', value)}
                    licenseNumber={form.licenseNumber}
                    setLicenseNumber={(value) =>
                        updateForm('licenseNumber', value)
                    }
                    onNext={continueUserInfo}
                    onBack={() => setStep('otp')}
                    onRestart={restart}
                    loading={loading}
                    externalError={error}
                />
            )}

            {step === 'password' && (
                <PasswordStep
                    password={form.password}
                    setPassword={(value) => updateForm('password', value)}
                    confirmPassword={form.confirmPassword}
                    setConfirmPassword={(value) =>
                        updateForm('confirmPassword', value)
                    }
                    onSubmit={finishRegistration}
                    onBack={() => setStep('user-info')}
                    loading={loading}
                    externalError={error}
                />
            )}
        </AuthLayout>
    );
}
