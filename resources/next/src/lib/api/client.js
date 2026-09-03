const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (
    configuredApiUrl || 'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export class ApiError extends Error {
    constructor(message, status, payload = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
        this.errors = payload?.errors || {};
    }
}

export function getAuthToken() {
    if (typeof window === 'undefined') return null;

    return window.localStorage.getItem(TOKEN_KEY)?.replace(/^Bearer\s+/i, '') || null;
}

export function getStoredUser() {
    if (typeof window === 'undefined') return null;

    try {
        return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null');
    } catch {
        window.localStorage.removeItem(USER_KEY);
        return null;
    }
}

export function storeAuthSession(payload) {
    if (typeof window === 'undefined') return;

    const token = payload?.access_token;
    if (!token) throw new Error('توکن ورود از سرور دریافت نشد.');

    window.localStorage.setItem(TOKEN_KEY, token.replace(/^Bearer\s+/i, ''));
    window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user || null));
}

export function clearAuthSession() {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
}

function firstError(payload, fallback) {
    const validationError = payload?.errors
        ? Object.values(payload.errors).flat().find(Boolean)
        : null;

    return validationError || payload?.message || fallback;
}

export async function apiRequest(path, options = {}) {
    const {
        auth = false,
        body,
        headers: customHeaders,
        ...fetchOptions
    } = options;
    const headers = {
        Accept: 'application/json',
        ...(body !== undefined && !(body instanceof FormData)
            ? { 'Content-Type': 'application/json' }
            : {}),
        ...customHeaders,
    };

    if (auth) {
        const token = getAuthToken();
        if (!token) {
            throw new ApiError('ابتدا وارد حساب کاربری شوید.', 401);
        }
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers,
        body:
            body === undefined || body instanceof FormData
                ? body
                : JSON.stringify(body),
        cache: fetchOptions.cache || 'no-store',
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 && auth) clearAuthSession();

        throw new ApiError(
            firstError(payload, 'ارتباط با سرور ناموفق بود.'),
            response.status,
            payload,
        );
    }

    return payload;
}

export function dashboardPathForUser(user) {
    if (['admin', 'super_admin'].includes(user?.role)) return '/admin';
    if (user?.role === 'lawyer') return '/lawyer';
    return '/client';
}
