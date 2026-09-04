const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCase = async (caseId) => {
    const response = await fetch(`${API_URL}/client/cases/${caseId}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('دریافت اطلاعات پرونده انجام نشد.');
    }

    return response.json();
};
