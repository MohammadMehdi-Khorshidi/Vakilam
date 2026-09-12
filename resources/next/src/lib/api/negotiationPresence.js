import { apiRequest, unwrapData } from './client';

export async function touchNegotiationPresence(
    negotiationId,
    typing = false,
) {
    return unwrapData(
        await apiRequest(
            `negotiations/${encodeURIComponent(
                negotiationId,
            )}/presence`,
            {
                method: 'POST',
                data: { typing },
            },
        ),
    );
}
