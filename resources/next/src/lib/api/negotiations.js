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
            `negotiations/${encodeURIComponent(publicId)}/messages`,
            {
                method: 'POST',
                data: { body },
            },
        ),
    );
