const API_BASE =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
    'http://vakilam.test/api';

export class ApiError extends Error {
    constructor(message, status, body = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
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
        API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`,
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
