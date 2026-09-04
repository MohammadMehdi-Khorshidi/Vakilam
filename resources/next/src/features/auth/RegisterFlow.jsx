'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/auth/AuthLayout';
import OtpStep from '@/components/auth/OtpStep';
import PasswordStep from '@/components/auth/PasswordStep';
import PhoneStep from '@/components/auth/PhoneStep';
import UserInfoStep from '@/components/auth/UserInfoStep';
import {
    dashboardForUser,
    persistAuthSession,
    registerUser,
    sendRegistrationOtp,
    verifyRegistrationOtp,
} from '@/lib/api/auth';

export default function RegisterFlow({ onGoToLogin }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [form, setForm] = useState({
        phone: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: '',
        licenseNumber: '',
    });

    useEffect(() => {
        const initialPhone = new URLSearchParams(window.location.search).get(
            'phone',
        );

        if (/^09\d{9}$/.test(initialPhone || '')) {
            setForm((current) => ({ ...current, phone: initialPhone }));
        }
    }, []);

    const updateForm = (key, value) => {
        if (apiError) setApiError('');
        setForm((current) => ({ ...current, [key]: value }));
    };

    const runRequest = async (callback) => {
        setLoading(true);
        setApiError('');

        try {
            return await callback();
        } catch (error) {
            setApiError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const startRegistration = async (phone) => {
        updateForm('phone', phone);
        const result = await runRequest(() => sendRegistrationOtp(phone));
        if (result) setStep(2);
    };

    const verifyOtp = async (code) => {
        const result = await runRequest(() =>
            verifyRegistrationOtp(form.phone, code),
        );

        if (!result) return;

        if (!result.verification_token) {
            setApiError('توکن تأیید ثبت‌نام از سرور دریافت نشد.');
            return;
        }

        setVerificationToken(result.verification_token);
        setStep(3);
    };

    const resendOtp = async () => {
        const result = await sendRegistrationOtp(form.phone);
        if (!result) throw new Error('ارسال مجدد کد ناموفق بود.');
    };

    const continueUserInfo = (normalizedLicense) => {
        if (form.role === 'lawyer') {
            updateForm('licenseNumber', normalizedLicense);
        }
        setStep(4);
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
        router.replace(dashboardForUser(result.user));
    };

    const restart = () => {
        setStep(1);
        setApiError('');
        setVerificationToken('');
        setForm({
            phone: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
            role: '',
            licenseNumber: '',
        });
    };

    return (
        <AuthLayout>
            {step === 1 && (
                <PhoneStep
                    phone={form.phone}
                    setPhone={(value) => updateForm('phone', value)}
                    onSubmit={startRegistration}
                    onGoToLogin={onGoToLogin}
                    loading={loading}
                    externalError={apiError}
                />
            )}

            {step === 2 && (
                <OtpStep
                    phone={form.phone}
                    onVerify={verifyOtp}
                    onCodeChange={() => setApiError('')}
                    onChangePhone={() => {
                        setApiError('');
                        setStep(1);
                    }}
                    onResend={resendOtp}
                    loading={loading}
                    externalError={apiError}
                />
            )}

            {step === 3 && (
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
                    onBack={() => setStep(2)}
                    onGoToLogin={onGoToLogin}
                    onRestart={restart}
                    loading={loading}
                    externalError={apiError}
                />
            )}

            {step === 4 && (
                <PasswordStep
                    password={form.password}
                    setPassword={(value) => updateForm('password', value)}
                    confirmPassword={form.confirmPassword}
                    setConfirmPassword={(value) =>
                        updateForm('confirmPassword', value)
                    }
                    onSubmit={finishRegistration}
                    onBack={() => setStep(3)}
                    loading={loading}
                    externalError={apiError}
                />
            )}
        </AuthLayout>
    );
}
