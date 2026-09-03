import { apiRequest } from '@/lib/api/client';

export const getCase = async (caseId) => {
    const result = await apiRequest(`/client/cases/${caseId}`, {
        method: 'GET',
        auth: true,
    });

    return result.data ?? result;
};
