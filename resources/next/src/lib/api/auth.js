import { ApiError, apiRequest, unwrapData } from './client';

const TOKEN_KEY = 'vakilam_access_token';
const USER_KEY = 'vakilam_user';

function normalizePhone(phone) {
    return String(phone || '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
        .replace(/\D/g, '');
}

/** Persist session after successful login / register. */
export function persistAuthSession(result) {
    if (typeof window === 'undefined' || !result) return;

    const token = result.access_token || result.token;
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }
    if (result.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    }
}

export function clearAuthSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/** Map role → dashboard path. */
export function dashboardForUser(user) {
    if (!user) return '/login';
    const role = user.role || (Array.isArray(user.roles) ? user.roles[0] : null);
    switch (role) {
        case 'lawyer':
            return '/lawyer';
        case 'admin':
        case 'super_admin':
            return '/admin';
        case 'client':
        default:
            return '/client';
    }
}

/**
 * Step 1 of passwordless login: check the active account and send an OTP.
 * POST /api/auth/login/send-otp
 */
export async function sendLoginOtp(phone) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/login/send-otp', {
        method: 'POST',
        data: { phone: normalized },
        auth: false,
    });
}

/**
 * Step 2 of passwordless login: verify the OTP and receive a Sanctum token.
 * POST /api/auth/login/verify-otp
 */
export async function verifyLoginOtp(phone, otp) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/login/verify-otp', {
        method: 'POST',
        data: {
            phone: normalized,
            otp: String(otp).trim(),
            device_name: 'web',
        },
        auth: false,
    });
}

/**
 * Logout current token.
 * POST /api/auth/logout
 */
export async function logout() {
    try {
        await apiRequest('auth/logout', { method: 'POST' });
    } catch (error) {
        // Still clear local session even if server call fails (expired token etc.)
        if (!(error instanceof ApiError && error.status === 401)) {
            // ignore
        }
    } finally {
        clearAuthSession();
    }
}

/**
 * Step 1 of registration: send OTP.
 * POST /api/auth/register/send-otp
 */
export async function sendRegistrationOtp(phone) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/register/send-otp', {
        method: 'POST',
        data: { phone: normalized },
        auth: false,
    });
}

/**
 * Step 2: verify OTP → receive verification_token.
 * POST /api/auth/register/verify-otp
 */
export async function verifyRegistrationOtp(phone, otp) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/register/verify-otp', {
        method: 'POST',
        data: {
            phone: normalized,
            otp: String(otp).trim(),
        },
        auth: false,
    });
}

/**
 * Final registration step.
 * POST /api/auth/register
 *
 * Accepts the form shape used by RegisterFlow (camelCase) and maps to API.
 */
export async function registerUser(form) {
    const phone = normalizePhone(form.phone);
    const payload = {
        first_name: String(form.firstName || form.first_name || '').trim(),
        last_name: String(form.lastName || form.last_name || '').trim(),
        phone,
        password: form.password,
        password_confirmation:
            form.confirmPassword || form.password_confirmation || form.password,
        role: form.role,
        terms_accepted: true,
        verification_token: form.verificationToken || form.verification_token,
    };

    if (form.role === 'lawyer') {
        payload.license_number = String(
            form.licenseNumber || form.license_number || '',
        ).trim();
    }

    return apiRequest('auth/register', {
        method: 'POST',
        data: payload,
        auth: false,
    });
}

/**
 * Password reset helpers (used by forgot-password flows if present).
 */
export async function sendPasswordResetOtp(phone) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/password/forgot/send-otp', {
        method: 'POST',
        data: { phone: normalized },
        auth: false,
    });
}

export async function verifyPasswordResetOtp(phone, otp) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/password/forgot/verify-otp', {
        method: 'POST',
        data: { phone: normalized, otp: String(otp).trim() },
        auth: false,
    });
}

export async function resetPassword({
    phone,
    password,
    passwordConfirmation,
    resetToken,
}) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/password/reset', {
        method: 'POST',
        data: {
            phone: normalized,
            password,
            password_confirmation: passwordConfirmation || password,
            reset_token: resetToken,
        },
        auth: false,
    });
}

export async function fetchCurrentUser() {
    return unwrapData(await apiRequest('user'));
}
