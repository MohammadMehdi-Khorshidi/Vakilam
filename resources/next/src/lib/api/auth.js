import { ApiError, apiRequest, unwrapData } from './client';

const TOKEN_KEY = 'vakilam_access_token';
const USER_KEY = 'vakilam_user';
export const AUTH_SESSION_EVENT = 'vakilam:auth-session-changed';

let restoreRequest = null;

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
    try {
        if (token) {
            window.localStorage.setItem(TOKEN_KEY, token);
        }
        if (result.user) {
            window.localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        }
    } catch {
        return;
    }

    window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function clearAuthSession() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
    } catch {
        // The in-memory UI still needs to be notified when storage is blocked.
    }

    window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getStoredUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getAccessToken() {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function getUserRoles(user) {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const primaryRole = user?.role;

    return [...new Set([primaryRole, ...roles].filter(Boolean))];
}

/** Map role → dashboard path. */
export function dashboardForUser(user) {
    const roles = getUserRoles(user);
    const role = user?.role || roles[0];

    switch (role) {
        case 'lawyer':
            return '/lawyer';
        case 'admin':
        case 'super_admin':
            return '/admin';
        case 'client':
            return '/client';
        default:
            return getAccessToken() ? '/client' : '/login';
    }
}

function storeCurrentUser(user) {
    if (typeof window === 'undefined' || !user) return;

    try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
        return;
    }

    window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

/**
 * Rehydrate the durable Sanctum token after a reload or a reopened tab.
 * A temporary network/server problem keeps the last known local session;
 * only an explicit 401/403 response invalidates it.
 */
export async function restoreAuthSession() {
    if (!getAccessToken()) return null;

    if (!restoreRequest) {
        restoreRequest = fetchCurrentUser()
            .then((user) => {
                storeCurrentUser(user);
                return user;
            })
            .catch((error) => {
                if (
                    error instanceof ApiError &&
                    (error.status === 401 || error.status === 403)
                ) {
                    clearAuthSession();
                    return null;
                }

                return getStoredUser();
            })
            .finally(() => {
                restoreRequest = null;
            });
    }

    return restoreRequest;
}

/**
 * Start the single phone-first authentication flow.
 * The server uses the same response whether the phone is already registered.
 */
export async function sendPhoneAuthOtp(phone) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/phone/send-otp', {
        method: 'POST',
        data: { phone: normalized },
        auth: false,
    });
}

/**
 * Existing phones receive a login session. New phones receive the
 * verification token needed to finish registration in the same page.
 */
export async function verifyPhoneAuthOtp(phone, otp) {
    const normalized = normalizePhone(phone);
    return apiRequest('auth/phone/verify-otp', {
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

/** Validate lawyer identity before asking the user to finish registration. */
export async function validateLawyerRegistration(form) {
    return apiRequest('auth/register/validate-lawyer', {
        method: 'POST',
        data: {
            first_name: String(form.firstName || '').trim(),
            last_name: String(form.lastName || '').trim(),
            phone: normalizePhone(form.phone),
            license_number: String(form.licenseNumber || '').trim(),
            verification_token: form.verificationToken,
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
