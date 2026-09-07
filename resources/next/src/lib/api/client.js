const CONFIGURED_API_BASE =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '';

function apiBaseUrl() {
    if (CONFIGURED_API_BASE) return CONFIGURED_API_BASE;
    if (typeof window !== 'undefined') return `${window.location.origin}/api`;

    throw new Error('NEXT_PUBLIC_API_URL is required for server-side API calls.');
}

export class ApiError extends Error {
    constructor(message, status, body = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
        this.validationMessages = body?.errors
            ? Object.values(body.errors)
                  .flat()
                  .filter(Boolean)
                  .map(String)
            : [];
    }
}

function getStoredToken() {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('vakilam_access_token');
    } catch {
        return null;
    }
}

/**
 * Low-level API request helper.
 * @param {string} path - path relative to /api (no leading slash required)
 * @param {{ method?: string, data?: any, query?: Record<string, any>, headers?: Record<string, string>, auth?: boolean }} options
 */
export async function apiRequest(path, options = {}) {
    const {
        method = 'GET',
        data,
        query,
        headers: extraHeaders = {},
        auth = true,
    } = options;

    const url = new URL(
        path.replace(/^\//, ''),
        apiBaseUrl().endsWith('/') ? apiBaseUrl() : `${apiBaseUrl()}/`,
    );

    if (query && typeof query === 'object') {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        });
    }

    const headers = {
        Accept: 'application/json',
        ...extraHeaders,
    };

    if (data !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (auth) {
        const token = getStoredToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(url.toString(), {
        method,
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined,
        credentials: 'include',
    });

    let body = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        try {
            body = await response.json();
        } catch {
            body = null;
        }
    }

    if (!response.ok) {
        const message =
            (body && (body.message || body.error)) ||
            (body?.errors &&
                Object.values(body.errors).flat().filter(Boolean)[0]) ||
            `خطا در ارتباط با سرور (${response.status})`;

        if (auth && response.status === 401 && typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem('vakilam_access_token');
                window.localStorage.removeItem('vakilam_user');
            } catch {
                // Storage may be unavailable, but the UI still needs the event.
            }

            window.dispatchEvent(new Event('vakilam:auth-session-changed'));
        }

        throw new ApiError(String(message), response.status, body);
    }

    return body;
}

/** Prefer `data` key when present (Laravel resource wrappers). */
export function unwrapData(payload) {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload.data;
    }
    return payload;
}
