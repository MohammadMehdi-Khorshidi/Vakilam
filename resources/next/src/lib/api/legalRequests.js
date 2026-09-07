import { ApiError, apiRequest, unwrapData } from './client';

const requestPath = (legalRequestId, suffix = '') => {
    const base = `legal-requests/${encodeURIComponent(legalRequestId)}`;
    return suffix ? `${base}/${suffix}` : base;
};

const unwrapLegalRequest = (payload) => {
    if (payload && typeof payload === 'object' && 'legal_request' in payload) {
        return payload.legal_request;
    }

    return unwrapData(payload);
};

export const listLegalRequests = (query = {}) =>
    apiRequest('legal-requests', { query });

export async function getCurrentDraft() {
    try {
        const payload = await apiRequest('legal-requests/draft');
        return unwrapLegalRequest(payload);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export const createLegalRequestDraft = async (data) =>
    unwrapLegalRequest(
        await apiRequest('legal-requests', { method: 'POST', data }),
    );

export const getLegalRequestProposals = async (legalRequestId) => {
    const payload = await apiRequest(requestPath(legalRequestId, 'proposals'));
    return payload?.proposals ?? unwrapData(payload);
};

export const getLegalRequest = async (legalRequestId) =>
    unwrapLegalRequest(await apiRequest(requestPath(legalRequestId)));

export const updateLegalRequestDraft = async (legalRequestId, data) =>
    unwrapLegalRequest(
        await apiRequest(requestPath(legalRequestId), {
            method: 'PATCH',
            data,
        }),
    );

export const submitLegalRequest = async (legalRequestId) =>
    unwrapLegalRequest(
        await apiRequest(requestPath(legalRequestId, 'submit'), {
            method: 'POST',
        }),
    );

export const getServiceOptions = async (legalRequestId) =>
    unwrapData(
        await apiRequest(requestPath(legalRequestId, 'service-options')),
    );

export const selectServiceIntent = async (legalRequestId, serviceIntent) =>
    unwrapData(
        await apiRequest(requestPath(legalRequestId, 'service-intent'), {
            method: 'POST',
            data: { service_intent: serviceIntent },
        }),
    );
