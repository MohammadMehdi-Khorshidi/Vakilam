import { apiRequest, unwrapData } from './client';

/** Fetch one legal matter that belongs to the authenticated client. */
export async function getClientCase(caseId) {
    const id = String(caseId || '').trim();
    if (!id) {
        throw new Error('شناسه پرونده الزامی است.');
    }

    return unwrapData(
        await apiRequest(`client/cases/${encodeURIComponent(id)}`),
    );
}
