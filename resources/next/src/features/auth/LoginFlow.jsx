'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/auth/AuthLayout';
import LoginStep from '@/components/auth/LoginStep';
import {
    dashboardForUser,
    loginWithPassword,
    persistAuthSession,
} from '@/lib/api/auth';

export default function LoginFlow({ onGoToRegister }) {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async (normalizedPhone) => {
        setLoading(true);
        setError('');

        try {
            const result = await loginWithPassword(
                normalizedPhone,
                password,
            );
            setPhone(normalizedPhone);
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
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <LoginStep
                phone={phone}
                setPhone={(value) => {
                    setPhone(value);
                    if (error) setError('');
                }}
                password={password}
                setPassword={(value) => {
                    setPassword(value);
                    if (error) setError('');
                }}
                onSubmit={login}
                onGoToRegister={onGoToRegister}
                loading={loading}
                externalError={error}
            />
        </AuthLayout>
    );
}
