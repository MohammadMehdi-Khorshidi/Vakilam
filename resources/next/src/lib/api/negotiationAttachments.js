import { apiDownload, apiRequest, unwrapData } from './client';

export async function uploadNegotiationAttachment(negotiationId, file) {
    const data = new FormData();
    data.append('file', file);

    return unwrapData(
        await apiRequest(
            `negotiations/${encodeURIComponent(negotiationId)}/attachments`,
            {
                method: 'POST',
                data,
            },
        ),
    );
}

export async function downloadNegotiationAttachment(publicId) {
    return apiDownload(
        `negotiation-attachments/${encodeURIComponent(publicId)}/download`,
    );
}
