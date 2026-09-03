'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    apiRequest,
    clearAuthSession,
    getAuthToken,
    getStoredUser,
    storeAuthSession,
} from '@/lib/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function hydrate() {
            if (!getAuthToken()) {
                if (active) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            const cachedUser = getStoredUser();
            if (cachedUser && active) setUser(cachedUser);

            try {
                const currentUser = await apiRequest('/user', { auth: true });
                if (active) {
                    window.localStorage.setItem('auth_user', JSON.stringify(currentUser));
                    setUser(currentUser);
                }
            } catch {
                clearAuthSession();
                if (active) setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        }

        hydrate();
        return () => {
            active = false;
        };
    }, []);

    const acceptSession = useCallback((payload) => {
        storeAuthSession(payload);
        setUser(payload.user || null);
        setLoading(false);
    }, []);

    const login = useCallback(async (credentials) => {
        const payload = await apiRequest('/auth/login', {
            method: 'POST',
            body: { ...credentials, device_name: 'next-web' },
        });
        storeAuthSession(payload);
        setUser(payload.user || null);
        return payload.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            if (getAuthToken()) {
                await apiRequest('/auth/logout', { method: 'POST', auth: true });
            }
        } finally {
            clearAuthSession();
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, logout, acceptSession }),
        [acceptSession, loading, login, logout, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider.');
    return context;
}
