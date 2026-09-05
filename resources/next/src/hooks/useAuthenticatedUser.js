'use client';

import { useEffect, useState } from 'react';

import { getStoredUser } from '@/lib/api/auth';

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

export default function useAuthenticatedUser() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const syncUser = () => setUser(getStoredUser());

        syncUser();
        window.addEventListener('storage', syncUser);

        return () => window.removeEventListener('storage', syncUser);
    }, []);

    return user;
}
