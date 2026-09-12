import { apiRequest, unwrapData } from './client';

export async function getLawyerCases() {
    return apiRequest('lawyer/cases');
}

export async function getLawyerCase(publicId) {
    return unwrapData(
        await apiRequest(
            `lawyer/cases/${encodeURIComponent(publicId)}`,
        ),
    );
}
