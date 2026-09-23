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

export async function getAdminLawyer(lawyerId) {
    return unwrapData(
        await apiRequest(`admin/lawyers/${encodeURIComponent(lawyerId)}`),
    );
}

export async function getAdminLegalRequests(query = {}) {
    return unwrapData(await apiRequest('admin/legal-requests', { query }));
}

export async function getAdminConsultations(query = {}) {
    return unwrapData(await apiRequest('admin/consultations', { query }));
}

export async function getAdminActivity(query = {}) {
    return unwrapData(await apiRequest('admin/activity', { query }));
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
