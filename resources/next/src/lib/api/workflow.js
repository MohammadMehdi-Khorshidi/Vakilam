import { apiDownload, apiRequest, unwrapData } from './client';

export async function getEngagementWorkspace(engagementId) {
    return unwrapData(
        await apiRequest(
            `engagements/${encodeURIComponent(engagementId)}/workspace`,
        ),
    );
}

export async function saveEngagementExecution(engagementId, data) {
    return unwrapData(
        await apiRequest(
            `engagements/${encodeURIComponent(engagementId)}/workspace`,
            {
                method: 'PATCH',
                data,
            },
        ),
    );
}

export async function sendEngagementContract(engagementId) {
    return unwrapData(
        await apiRequest(
            `engagements/${encodeURIComponent(engagementId)}/contract/send`,
            { method: 'POST' },
        ),
    );
}

export async function createEngagementDocumentRequest(engagementId, data) {
    return unwrapData(
        await apiRequest(
            `engagements/${encodeURIComponent(engagementId)}/document-requests`,
            { method: 'POST', data },
        ),
    );
}

export async function deleteEngagementDocumentRequest(publicId) {
    return apiRequest(
        `engagement-document-requests/${encodeURIComponent(publicId)}`,
        { method: 'DELETE' },
    );
}

export async function uploadEngagementDocument(publicId, file) {
    const data = new FormData();
    data.append('file', file);

    return unwrapData(
        await apiRequest(
            `engagement-document-requests/${encodeURIComponent(publicId)}/upload`,
            { method: 'POST', data },
        ),
    );
}

export async function reviewEngagementDocument(publicId, status, reviewNote = '') {
    return unwrapData(
        await apiRequest(
            `engagement-document-requests/${encodeURIComponent(publicId)}/review`,
            {
                method: 'POST',
                data: {
                    status,
                    review_note: reviewNote,
                },
            },
        ),
    );
}

export async function downloadDocument(publicId) {
    return apiDownload(`documents/${encodeURIComponent(publicId)}/download`);
}

export async function getClientEngagements() {
    return unwrapData(await apiRequest('client/engagements'));
}

export async function signContract(contractId) {
    return unwrapData(
        await apiRequest(
            `contracts/${encodeURIComponent(contractId)}/sign`,
            { method: 'POST' },
        ),
    );
}

export async function startInvoicePayment(invoiceId) {
    const key =
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}-vakilam`;

    return unwrapData(
        await apiRequest(
            `invoices/${encodeURIComponent(invoiceId)}/payments`,
            {
                method: 'POST',
                headers: { 'Idempotency-Key': key },
            },
        ),
    );
}
