'use client';

let echoPromise = null;

function apiBase() {
    const configured = process.env.NEXT_PUBLIC_API_URL;

    if (configured) {
        return configured.replace(/\/+$/, '');
    }

    return `${window.location.origin}/api`;
}

function authToken() {
    try {
        return window.localStorage.getItem('vakilam_access_token');
    } catch {
        return null;
    }
}

function sanitizeText(value) {
    return String(value ?? '')
        .replace(/^\uFEFF/, '')
        .trim();
}

async function loadRealtimeConfig() {
    const token = authToken();

    const response = await fetch(`${apiBase()}/realtime/config`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const raw = sanitizeText(await response.text());

    if (!response.ok) {
        throw new Error(
            `Realtime config failed (${response.status})`,
        );
    }

    try {
        return JSON.parse(raw);
    } catch {
        throw new Error(
            `Realtime config returned invalid JSON (${response.status})`,
        );
    }
}

function createAuthorizer(authEndpoint) {
    return (channel) => ({
        authorize: async (socketId, callback) => {
            try {
                const token = authToken();

                const response = await fetch(authEndpoint, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type':
                            'application/x-www-form-urlencoded;charset=UTF-8',
                        ...(token
                            ? {
                                  Authorization: `Bearer ${token}`,
                              }
                            : {}),
                    },
                    body: new URLSearchParams({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }).toString(),
                });

                const raw = sanitizeText(
                    await response.text(),
                );

                let payload;

                try {
                    payload = raw ? JSON.parse(raw) : null;
                } catch {
                    callback(
                        true,
                        `Realtime auth invalid JSON (${response.status}): ${raw.slice(
                            0,
                            160,
                        )}`,
                    );
                    return;
                }

                if (!response.ok) {
                    callback(
                        true,
                        payload?.message ||
                            `Realtime auth failed (${response.status})`,
                    );
                    return;
                }

                if (!payload || typeof payload !== 'object') {
                    callback(
                        true,
                        'Realtime auth returned an empty response.',
                    );
                    return;
                }

                callback(false, payload);
            } catch (error) {
                callback(
                    true,
                    error?.message ||
                        'Realtime authorization request failed.',
                );
            }
        },
    });
}

export async function getEcho() {
    if (typeof window === 'undefined') return null;

    if (echoPromise) return echoPromise;

    echoPromise = (async () => {
        const [
            { default: Echo },
            { default: Pusher },
            config,
        ] = await Promise.all([
            import('laravel-echo'),
            import('pusher-js'),
            loadRealtimeConfig(),
        ]);

        window.Pusher = Pusher;

        const scheme = config?.scheme || 'http';
        const host =
            config?.host ||
            window.location.hostname ||
            '127.0.0.1';
        const port = Number(config?.port || 8080);
        const authEndpoint =
            config?.auth_endpoint ||
            `${apiBase()}/realtime/auth`;

        return new Echo({
            broadcaster: 'reverb',
            key: config?.key,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authorizer: createAuthorizer(authEndpoint),
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
        // REST remains usable if realtime is unavailable.
    }
}

export function resetEcho() {
    echoPromise = null;
}
