import { apiRequest, unwrapData } from './client';

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
            {
                method: 'POST',
            },
        ),
    );
}

export async function signContract(contractId) {
    return unwrapData(
        await apiRequest(
            `contracts/${encodeURIComponent(contractId)}/sign`,
            {
                method: 'POST',
            },
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
                headers: {
                    'Idempotency-Key': key,
                },
            },
        ),
    );
}
