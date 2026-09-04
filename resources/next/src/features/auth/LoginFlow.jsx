'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/auth/AuthLayout';
import LoginStep from '@/components/auth/LoginStep';
import OtpStep from '@/components/auth/OtpStep';
import {
    dashboardForUser,
    persistAuthSession,
    sendLoginOtp,
    verifyLoginOtp,
} from '@/lib/api/auth';

export default function LoginFlow({ onGoToRegister }) {
    const router = useRouter();
    const [step, setStep] = useState('phone');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        setPhone(normalizedPhone);

        const result = await runRequest(() => sendLoginOtp(normalizedPhone));
        if (result) setStep('otp');
    };

    const login = async (code) => {
        const result = await runRequest(() => verifyLoginOtp(phone, code));
        if (!result) return;

        persistAuthSession(result);

        const destination = dashboardForUser(result.user);
        const redirectTo = new URLSearchParams(window.location.search).get(
            'redirect',
        );
        const safeRedirect =
            redirectTo?.startsWith(destination) &&
            !redirectTo.startsWith('//')
                ? redirectTo
                : destination;

        router.replace(safeRedirect);
    };

    const resendOtp = async () => {
        await sendLoginOtp(phone);
    };

    return (
        <AuthLayout>
            {step === 'phone' && (
                <LoginStep
                    phone={phone}
                    setPhone={(value) => {
                        setPhone(value);
                        if (error) setError('');
                    }}
                    onSubmit={requestOtp}
                    onGoToRegister={onGoToRegister}
                    loading={loading}
                    externalError={error}
                />
            )}

            {step === 'otp' && (
                <OtpStep
                    phone={phone}
                    onVerify={login}
                    onCodeChange={() => setError('')}
                    onChangePhone={() => {
                        setError('');
                        setStep('phone');
                    }}
                    onResend={resendOtp}
                    isLogin
                    loading={loading}
                    externalError={error}
                />
            )}
        </AuthLayout>
    );
}
