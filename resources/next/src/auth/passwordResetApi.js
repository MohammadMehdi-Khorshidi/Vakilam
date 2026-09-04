const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const PASSWORD_RESET_STORAGE_KEY = 'vakilam_password_reset';

export const normalizeDigits = (value) =>
    value
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const firstApiError = (payload, fallback) => {
    const validationError = payload?.errors
        ? Object.values(payload.errors).flat().find(Boolean)
        : null;

    return validationError || payload?.message || fallback;
};

export async function passwordResetRequest(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            firstApiError(payload, 'ارتباط با سرور ناموفق بود.'),
        );
    }

    return payload;
}
