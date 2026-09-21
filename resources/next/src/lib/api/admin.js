import { apiRequest, unwrapData } from './client';

export async function getAdminDashboard() {
    return unwrapData(await apiRequest('admin/dashboard'));
}

export async function getAdminUsers(query = {}) {
    return unwrapData(await apiRequest('admin/users', { query }));
}

export async function setAdminUserStatus(userId, status, reason) {
    return apiRequest(`admin/users/${encodeURIComponent(userId)}/status`, {
        method: 'PATCH',
        data: { status, reason },
    });
}

export async function getAdminLawyers(query = {}) {
    return unwrapData(await apiRequest('admin/lawyers', { query }));
}

export async function reviewAdminLawyer(verificationId, status, note = '') {
    return apiRequest(
        `admin/lawyer-verifications/${encodeURIComponent(verificationId)}/review`,
        { method: 'POST', data: { status, note } },
    );
}

export async function getAdminLegalRequests() {
    return unwrapData(await apiRequest('admin/legal-requests'));
}

export async function getAdminConsultations() {
    return unwrapData(await apiRequest('admin/consultations'));
}

export async function getAdminActivity() {
    return unwrapData(await apiRequest('admin/activity'));
}

export async function getAdmins() {
    return unwrapData(await apiRequest('admin/admins'));
}

export async function setAdminRole(userId, enabled, reason = '') {
    return apiRequest(`admin/admins/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        data: { enabled, reason },
    });
}
