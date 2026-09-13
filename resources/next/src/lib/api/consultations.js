import { apiRequest, unwrapData } from './client';

export async function getLawyerAvailabilities() {
    return unwrapData(await apiRequest('lawyer/availabilities'));
}

export async function createLawyerAvailability(payload) {
    return unwrapData(
        await apiRequest('lawyer/availabilities', {
            method: 'POST',
            data: payload,
        }),
    );
}

export async function updateLawyerAvailability(id, payload) {
    return unwrapData(
        await apiRequest(`lawyer/availabilities/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            data: payload,
        }),
    );
}

export async function deleteLawyerAvailability(id) {
    return apiRequest(
        `lawyer/availabilities/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
    );
}

export async function getConsultationLawyers(legalRequestId) {
    return apiRequest(
        `legal-requests/${encodeURIComponent(legalRequestId)}/consultation-lawyers`,
    );
}

export async function getConsultationSlots(legalRequestId, lawyerPublicId, duration) {
    return unwrapData(
        await apiRequest(
            `legal-requests/${encodeURIComponent(legalRequestId)}/consultation-lawyers/${encodeURIComponent(lawyerPublicId)}/slots?duration=${encodeURIComponent(duration)}`,
        ),
    );
}

export async function reserveConsultation(legalRequestId, payload) {
    return unwrapData(
        await apiRequest(
            `legal-requests/${encodeURIComponent(legalRequestId)}/consultations`,
            {
                method: 'POST',
                data: payload,
            },
        ),
    );
}

export async function getClientConsultations() {
    return unwrapData(await apiRequest('client/consultations'));
}

export async function getLawyerConsultations() {
    return unwrapData(await apiRequest('lawyer/consultations'));
}
