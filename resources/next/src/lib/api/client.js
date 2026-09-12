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

function buildUrl(path, query) {
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

    return url;
}

function authHeaders(extraHeaders = {}, auth = true) {
    const headers = {
        Accept: 'application/json',
        ...extraHeaders,
    };

    if (auth) {
        const token = getStoredToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Low-level API request helper.
 * `data` can be a plain object or FormData.
 */
export async function apiRequest(path, options = {}) {
    const {
        method = 'GET',
        data,
        query,
        headers: extraHeaders = {},
        auth = true,
    } = options;

    const url = buildUrl(path, query);
    const headers = authHeaders(extraHeaders, auth);
    const isFormData =
        typeof FormData !== 'undefined' && data instanceof FormData;

    let body;
    if (data !== undefined) {
        if (isFormData) {
            body = data;
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(data);
        }
    }

    const response = await fetch(url.toString(), {
        method,
        headers,
        body,
        credentials: 'include',
    });

    let responseBody = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        try {
            responseBody = await response.json();
        } catch {
            responseBody = null;
        }
    }

    if (!response.ok) {
        const message =
            (responseBody && (responseBody.message || responseBody.error)) ||
            (responseBody?.errors &&
                Object.values(responseBody.errors).flat().filter(Boolean)[0]) ||
            `خطا در ارتباط با سرور (${response.status})`;

        if (auth && response.status === 401 && typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem('vakilam_access_token');
                window.localStorage.removeItem('vakilam_user');
            } catch {
                // Storage may be unavailable.
            }

            window.dispatchEvent(new Event('vakilam:auth-session-changed'));
        }

        throw new ApiError(String(message), response.status, responseBody);
    }

    return responseBody;
}

export async function apiDownload(path, options = {}) {
    const { query, auth = true } = options;
    const response = await fetch(buildUrl(path, query).toString(), {
        method: 'GET',
        headers: authHeaders({}, auth),
        credentials: 'include',
    });

    if (!response.ok) {
        let body = null;
        try {
            body = await response.json();
        } catch {
            body = null;
        }
        throw new ApiError(
            body?.message || `خطا در دریافت فایل (${response.status})`,
            response.status,
            body,
        );
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const utfName = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainName = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = utfName
        ? decodeURIComponent(utfName[1])
        : plainName?.[1] || 'document';

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
}

export function unwrapData(payload) {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload.data;
    }
    return payload;
}
