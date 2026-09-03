import { apiRequest } from './client';

function unwrapLegalRequest(payload) {
    return payload?.legal_request ?? payload?.data?.legal_request ?? payload?.data ?? payload ?? null;
}

export async function getLegalRequestDraft() {
    const payload = await apiRequest('/legal-requests/draft', { auth: true });
    return unwrapLegalRequest(payload);
}

export async function getLegalRequest(id) {
    const payload = await apiRequest(`/legal-requests/${id}`, { auth: true });
    return unwrapLegalRequest(payload);
}

export async function createLegalRequest(body) {
    const payload = await apiRequest('/legal-requests', {
        method: 'POST',
        auth: true,
        body,
    });
    return unwrapLegalRequest(payload);
}

export async function updateLegalRequest(id, body) {
    const payload = await apiRequest(`/legal-requests/${id}`, {
        method: 'PATCH',
        auth: true,
        body,
    });
    return unwrapLegalRequest(payload);
}

export async function submitLegalRequest(id) {
    const payload = await apiRequest(`/legal-requests/${id}/submit`, {
        method: 'POST',
        auth: true,
    });
    return unwrapLegalRequest(payload);
}

export async function selectServiceIntent(id, serviceIntent) {
    return apiRequest(`/legal-requests/${id}/service-intent`, {
        method: 'POST',
        auth: true,
        body: { service_intent: serviceIntent },
    });
}

export async function startMatching(id) {
    return apiRequest(`/legal-requests/${id}/matching`, {
        method: 'POST',
        auth: true,
    });
}

export async function getMatching(id) {
    return apiRequest(`/legal-requests/${id}/matching`, { auth: true });
}


export async function getLawyersForRequest(id, { page = 1, q = '', perPage = 20 } = {}) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (q.trim()) params.set('q', q.trim());

    return apiRequest(`/legal-requests/${id}/lawyers?${params.toString()}`, { auth: true });
}

export async function sendLawyerRequests(id, lawyerPublicIds) {
    return apiRequest(`/legal-requests/${id}/lawyer-requests`, {
        method: 'POST',
        auth: true,
        body: { lawyer_public_ids: lawyerPublicIds },
    });
}

export async function getLegalRequestProposals(id) {
    const payload = await apiRequest(`/legal-requests/${id}/proposals`, { auth: true });
    return payload?.proposals ?? [];
}

export async function selectProposal(id, proposalPublicId) {
    return apiRequest(`/legal-requests/${id}/proposals/${proposalPublicId}/select`, {
        method: 'POST',
        auth: true,
    });
}

export async function uploadLegalRequestDocument(id, file, title = '') {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title || file.name || 'مدرک پرونده');

    return apiRequest(`/legal-requests/${id}/documents`, {
        method: 'POST',
        auth: true,
        body: form,
    });
}
