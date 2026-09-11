import { apiRequest, unwrapData } from './client';

export const getNegotiation = async (publicId) =>
    unwrapData(
        await apiRequest(
            `negotiations/${encodeURIComponent(publicId)}`,
        ),
    );

export const sendNegotiationMessage = async (publicId, body) =>
    unwrapData(
        await apiRequest(
            `negotiations/${encodeURIComponent(
                publicId,
            )}/messages`,
            {
                method: 'POST',
                data: { body },
            },
        ),
    );

export const rejectLawyerProposal = async (
    proposalPublicId,
) =>
    apiRequest(
        `lawyer/proposals/${encodeURIComponent(
            proposalPublicId,
        )}/reject`,
        { method: 'POST' },
    );

export const acceptLawyerProposal = async (
    proposalPublicId,
) =>
    apiRequest(
        `lawyer/proposals/${encodeURIComponent(
            proposalPublicId,
        )}/select`,
        { method: 'POST' },
    );
