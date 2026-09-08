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

export const deleteLegalRequestDraft = async (legalRequestId) =>
    apiRequest(requestPath(legalRequestId), {
        method: 'DELETE',
    });

export async function updateLegalRequestDraft(legalRequestId, data) {
    try {
        return unwrapLegalRequest(
            await apiRequest(requestPath(legalRequestId), {
                method: 'PATCH',
                data,
            }),
        );
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            const existing = await getLegalRequest(legalRequestId);
            if (existing?.status === 'submitted') return existing;
        }

        if (error instanceof ApiError && error.status === 404) {
            return createLegalRequestDraft(data);
        }

        throw error;
    }
}

export async function submitLegalRequest(legalRequestId) {
    try {
        return unwrapLegalRequest(
            await apiRequest(requestPath(legalRequestId, 'submit'), {
                method: 'POST',
            }),
        );
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            const existing = await getLegalRequest(legalRequestId);
            if (existing?.status === 'submitted') return existing;
        }

        throw error;
    }
}

export const getServiceOptions = async (legalRequestId) =>
    unwrapData(await apiRequest(requestPath(legalRequestId, 'service-options')));

export const selectServiceIntent = async (legalRequestId, serviceIntent) =>
    unwrapData(
        await apiRequest(requestPath(legalRequestId, 'service-intent'), {
            method: 'POST',
            data: { service_intent: serviceIntent },
        }),
    );

export const runLawyerMatching = async (legalRequestId, query = {}) =>
    apiRequest(requestPath(legalRequestId, 'matching'), {
        method: 'POST',
        query,
    });

export const getLawyerMatching = async (legalRequestId, query = {}) =>
    apiRequest(requestPath(legalRequestId, 'matching'), { query });

export const listSelectableLawyers = async (legalRequestId, query = {}) =>
    apiRequest(requestPath(legalRequestId, 'lawyers'), { query });

export const sendLawyerRequests = async (legalRequestId, lawyerPublicIds) =>
    apiRequest(requestPath(legalRequestId, 'lawyer-requests'), {
        method: 'POST',
        data: { lawyer_public_ids: lawyerPublicIds },
    });

export const getClientLawyerRequests = async (legalRequestId) =>
    apiRequest(requestPath(legalRequestId, 'lawyer-requests'));
