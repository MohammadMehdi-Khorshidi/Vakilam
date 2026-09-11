'use client';

let echoPromise = null;

function apiBase() {
    const configured = process.env.NEXT_PUBLIC_API_URL;
    if (configured) return configured.replace(/\/+$/, '');
    return `${window.location.origin}/api`;
}

function authToken() {
    try {
        return window.localStorage.getItem('vakilam_access_token');
    } catch {
        return null;
    }
}

export async function getEcho() {
    if (typeof window === 'undefined') return null;
    if (echoPromise) return echoPromise;

    echoPromise = (async () => {
        const [{ default: Echo }, { default: Pusher }] =
            await Promise.all([
                import('laravel-echo'),
                import('pusher-js'),
            ]);

        window.Pusher = Pusher;

        const token = authToken();
        const scheme =
            process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http';
        const port = Number(
            process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
        );

        return new Echo({
            broadcaster: 'reverb',
            key:
                process.env.NEXT_PUBLIC_REVERB_APP_KEY ||
                'vakilam-local-key',
            wsHost:
                process.env.NEXT_PUBLIC_REVERB_HOST ||
                window.location.hostname ||
                '127.0.0.1',
            wsPort: port,
            wssPort: port,
            forceTLS: scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: `${apiBase()}/broadcasting/auth`,
            auth: {
                headers: {
                    Accept: 'application/json',
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {}),
                },
            },
        });
    })().catch((error) => {
        echoPromise = null;
        throw error;
    });

    return echoPromise;
}

export async function leaveNegotiationChannel(publicId) {
    try {
        const echo = await getEcho();
        echo?.leave(`negotiation.${publicId}`);
    } catch {
        // REST chat remains usable if realtime is unavailable.
    }
}
