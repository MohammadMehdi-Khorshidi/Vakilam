'use client';

import { useEffect, useState } from 'react';

import {
    AUTH_SESSION_EVENT,
    getAccessToken,
    getStoredUser,
    restoreAuthSession,
} from '@/lib/api/auth';

export function getUserDisplayName(user) {
    const firstName = String(
        user?.first_name || user?.firstName || user?.name || '',
    ).trim();
    const lastName = String(user?.last_name || user?.lastName || '').trim();
    const profileName = String(
        user?.full_name || user?.fullName || user?.profile?.full_name || '',
    ).trim();

    if (firstName && lastName) {
        const normalizedFirstName = firstName.toLocaleLowerCase();
        const normalizedLastName = lastName.toLocaleLowerCase();

        return normalizedFirstName.endsWith(normalizedLastName)
            ? firstName
            : `${firstName} ${lastName}`;
    }

    return firstName || lastName || profileName || 'کاربر';
}

export function getUserInitial(user) {
    return Array.from(getUserDisplayName(user))[0] || 'ک';
}

export function useAuthSession() {
    const [session, setSession] = useState({
        user: null,
        authenticated: false,
        ready: false,
    });

    useEffect(() => {
        let mounted = true;

        const syncSession = (ready = true) => {
            if (!mounted) return;

            setSession({
                user: getStoredUser(),
                authenticated: Boolean(getAccessToken()),
                ready,
            });
        };

        syncSession(false);

        const handleSessionChange = () => syncSession(true);

        restoreAuthSession().finally(handleSessionChange);
        window.addEventListener('storage', handleSessionChange);
        window.addEventListener(AUTH_SESSION_EVENT, handleSessionChange);

        return () => {
            mounted = false;
            window.removeEventListener('storage', handleSessionChange);
            window.removeEventListener(
                AUTH_SESSION_EVENT,
                handleSessionChange,
            );
        };
    }, []);

    return session;
}

export default function useAuthenticatedUser() {
    const { user } = useAuthSession();

    return user;
}
