'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/auth/AuthLayout';
import LoginStep from '@/components/auth/LoginStep';
import OtpStep from '@/components/auth/OtpStep';

export default function LoginFlow({ onGoToRegister }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [registeredUser, setRegisteredUser] = useState(null);

    const checkPhone = (normalizedPhone) => {
        const savedUser = localStorage.getItem('demo_auth_user');

        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);

                if (user.phone === normalizedPhone && user.role) {
                    setPhone(normalizedPhone);
                    setRegisteredUser(user);
                    setStep(2);
                    return;
                }
            } catch {
                localStorage.removeItem('demo_auth_user');
            }
        }

        router.push(
            `/login/register?phone=${encodeURIComponent(normalizedPhone)}`,
        );
    };

    const verifyOtp = () => {
        const destination =
            registeredUser?.role === 'lawyer' ? '/lawyer' : '/client';
        const redirectTo = new URLSearchParams(window.location.search).get(
            'redirect',
        );
        const safeRedirect =
            redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
                ? redirectTo
                : destination;

        router.push(safeRedirect);
    };

    return (
        <AuthLayout>
            {step === 1 && (
                <LoginStep
                    phone={phone}
                    setPhone={setPhone}
                    onSubmit={checkPhone}
                    onGoToRegister={onGoToRegister}
                />
            )}

            {step === 2 && (
                <OtpStep
                    phone={phone}
                    onVerify={verifyOtp}
                    onChangePhone={() => {
                        setRegisteredUser(null);
                        setStep(1);
                    }}
                    isLogin
                />
            )}
        </AuthLayout>
    );
}
