import { ApiError, apiRequest, unwrapData } from './client';

const requestPath = (legalRequestId, suffix = '') => {
    const base = `legal-requests/${encodeURIComponent(legalRequestId)}`;
    return suffix ? `${base}/${suffix}` : base;
};

export const listLegalRequests = (query = {}) =>
    apiRequest('legal-requests', { query });

export async function getCurrentDraft() {
    try {
        return unwrapData(await apiRequest('legal-requests/draft'));
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export const createLegalRequestDraft = async (data) =>
    unwrapData(
        await apiRequest('legal-requests', { method: 'POST', data }),
    );

export const getLegalRequestProposals = async (legalRequestId) =>
    unwrapData(
        await apiRequest(requestPath(legalRequestId, 'proposals')),
    );

export const getLegalRequest = async (legalRequestId) =>
    unwrapData(await apiRequest(requestPath(legalRequestId)));

export const updateLegalRequestDraft = async (legalRequestId, data) =>
    unwrapData(
        await apiRequest(requestPath(legalRequestId), {
            method: 'PATCH',
            data,
        }),
    );

export const submitLegalRequest = async (legalRequestId) =>
    unwrapData(
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
