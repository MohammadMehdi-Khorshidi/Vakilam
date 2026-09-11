import { apiRequest, unwrapData } from './client';

export const getLawyerInvitations = async (query = {}) =>
    apiRequest('lawyer/invitations', { query });

export const respondToLawyerInvitation = async (distributionId, action) =>
    apiRequest(
        `lawyer/distributions/${encodeURIComponent(distributionId)}/respond`,
        {
            method: 'POST',
            data: { action },
        },
    );

export const getLawyerNegotiations = async (query = {}) =>
    apiRequest('lawyer/negotiations', { query });

export const getNegotiation = async (publicId) =>
    unwrapData(
        await apiRequest(
            `negotiations/${encodeURIComponent(publicId)}`,
        ),
    );

export const sendNegotiationMessage = async (publicId, body) =>
    unwrapData(
        await apiRequest(
            `negotiations/${encodeURIComponent(publicId)}/messages`,
            {
                method: 'POST',
                data: { body },
            },
        ),
    );

export const createNegotiationProposal = async (publicId, data) => {
    const payload = await apiRequest(
        `negotiations/${encodeURIComponent(publicId)}/proposal`,
        {
            method: 'POST',
            data,
        },
    );

    return payload?.proposal ?? unwrapData(payload);
};

export const submitLawyerProposal = async (proposalPublicId) => {
    const payload = await apiRequest(
        `lawyer/proposals/${encodeURIComponent(proposalPublicId)}/submit`,
        {
            method: 'POST',
        },
    );

    return payload?.proposal ?? unwrapData(payload);
};
