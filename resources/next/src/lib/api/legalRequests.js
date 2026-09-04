const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function getLegalRequest(legalRequestId) {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        throw new Error('توکن ورود پیدا نشد.');
    }

    const response = await fetch(
        `${API_BASE_URL}/legal-requests/${legalRequestId}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        },
    );

    const result = await response.json();

    if (response.status === 401) {
        throw new Error('ابتدا وارد حساب کاربری شوید.');
    }

    if (!response.ok) {
        throw new Error(result.message || 'دریافت درخواست ناموفق بود.');
    }

    return result.data ?? result;
}
