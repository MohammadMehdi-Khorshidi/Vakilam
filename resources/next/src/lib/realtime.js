'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;
let echoToken = null;
let creatingPromise = null;

function apiBaseUrl() {
    const configured =
        typeof process !== 'undefined'
            ? process.env.NEXT_PUBLIC_API_URL
            : '';

    if (configured) {
        return configured.endsWith('/')
            ? configured.slice(0, -1)
            : configured;
    }

    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }

    return '';
}

function storedToken() {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem('vakilam_access_token');
    } catch {
        return null;
    }
}

async function fetchRealtimeConfig(token) {
    const response = await fetch(`${apiBaseUrl()}/realtime/config`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Realtime config failed (${response.status})`);
    }

    const payload = await response.json();
    const config = payload?.data;

    if (!config?.key || !config?.host || !config?.port || !config?.scheme) {
        throw new Error('Realtime config is incomplete.');
    }

    return config;
}

export function disconnectRealtime() {
    if (echoInstance) {
        try { echoInstance.disconnect(); } catch {}
    }

    echoInstance = null;
    echoToken = null;
    creatingPromise = null;
}

export async function getRealtimeEcho() {
    if (typeof window === 'undefined') return null;

    const token = storedToken();
    if (!token) return null;

    if (echoInstance && echoToken === token) return echoInstance;
    if (creatingPromise && echoToken === token) return creatingPromise;

    disconnectRealtime();
    echoToken = token;

    creatingPromise = (async () => {
        const config = await fetchRealtimeConfig(token);
        window.Pusher = Pusher;

        const port = Number(config.port);

        const instance = new Echo({
            broadcaster: 'reverb',
            key: config.key,
            wsHost: config.host,
            wsPort: port,
            wssPort: port,
            forceTLS: config.scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: config.auth_endpoint,
            auth: {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        echoInstance = instance;
        creatingPromise = null;
        return instance;
    })().catch((error) => {
        echoInstance = null;
        echoToken = null;
        creatingPromise = null;
        throw error;
    });

    return creatingPromise;
}
