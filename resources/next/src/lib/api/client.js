const CONFIGURED_API_BASE =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '';

function apiBaseUrl() {
    if (CONFIGURED_API_BASE) return CONFIGURED_API_BASE;
    if (typeof window !== 'undefined') return `${window.location.origin}/api`;
    throw new Error('آدرس API برای درخواست‌های سمت سرور تنظیم نشده است.');
}

function hasPersian(text) {
    return /[\u0600-\u06FF]/.test(String(text || ''));
}

function fallbackForStatus(status) {
    if (status === 400) return 'درخواست ارسال‌شده معتبر نیست.';
    if (status === 401) return 'نشست شما منقضی شده است. دوباره وارد حساب شوید.';
    if (status === 403) return 'اجازه انجام این عملیات را ندارید.';
    if (status === 404) return 'اطلاعات موردنظر پیدا نشد.';
    if (status === 409) return 'این عملیات با وضعیت فعلی امکان‌پذیر نیست. صفحه را به‌روزرسانی کنید.';
    if (status === 422) return 'اطلاعات واردشده معتبر نیست. موارد فرم را بررسی کنید.';
    if (status === 429) return 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.';
    if (status >= 500) return 'خطایی در سرور رخ داد. دوباره تلاش کنید.';
    return `خطا در ارتباط با سرور${status ? ` (${status})` : ''}`;
}

export function localizeApiMessage(message, status = 0) {
    const text = String(message || '').trim();
    if (text && hasPersian(text)) return text;
    return fallbackForStatus(status);
}

export class ApiError extends Error {
    constructor(message, status, body = null) {
        const localized = localizeApiMessage(message, status);
        super(localized);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
        this.validationMessages = body?.errors
            ? Object.values(body.errors).flat().filter(Boolean).map((value) => localizeApiMessage(value, status))
            : [];
    }
}

function getStoredToken() {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem('vakilam_access_token'); } catch { return null; }
}

function buildUrl(path, query) {
    const url = new URL(path.replace(/^\//, ''), apiBaseUrl().endsWith('/') ? apiBaseUrl() : `${apiBaseUrl()}/`);
    if (query && typeof query === 'object') {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
        });
    }
    return url;
}

function authHeaders(extraHeaders = {}, auth = true) {
    const headers = { Accept: 'application/json', ...extraHeaders };
    if (auth) { const token = getStoredToken(); if (token) headers.Authorization = `Bearer ${token}`; }
    return headers;
}

export async function apiRequest(path, options = {}) {
    const { method='GET', data, query, headers: extraHeaders={}, auth=true } = options;
    const url = buildUrl(path, query);
    const headers = authHeaders(extraHeaders, auth);
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    let body;
    if (data !== undefined) {
        if (isFormData) body = data;
        else { headers['Content-Type']='application/json'; body=JSON.stringify(data); }
    }

    let response;
    try {
        response = await fetch(url.toString(), { method, headers, body, credentials:'include' });
    } catch {
        throw new ApiError('ارتباط با سرور برقرار نشد. اتصال اینترنت و اجرای سرور را بررسی کنید.', 0, null);
    }

    let responseBody=null;
    const contentType=response.headers.get('content-type')||'';
    if (contentType.includes('application/json')) { try { responseBody=await response.json(); } catch { responseBody=null; } }

    if (!response.ok) {
        const raw=(responseBody && (responseBody.message||responseBody.error)) || (responseBody?.errors && Object.values(responseBody.errors).flat().filter(Boolean)[0]) || '';
        if (auth && response.status===401 && typeof window!=='undefined') {
            try { window.localStorage.removeItem('vakilam_access_token'); window.localStorage.removeItem('vakilam_user'); } catch {}
            window.dispatchEvent(new Event('vakilam:auth-session-changed'));
        }
        throw new ApiError(raw, response.status, responseBody);
    }
    return responseBody;
}

export async function apiDownload(path, options={}) {
    const {query,auth=true}=options;
    let response;
    try { response=await fetch(buildUrl(path,query).toString(),{method:'GET',headers:authHeaders({},auth),credentials:'include'}); }
    catch { throw new ApiError('دریافت فایل به دلیل قطع ارتباط با سرور انجام نشد.',0,null); }
    if(!response.ok){ let body=null; try{body=await response.json()}catch{} throw new ApiError(body?.message,response.status,body); }
    const blob=await response.blob();
    const disposition=response.headers.get('content-disposition')||'';
    const utfName=disposition.match(/filename\*=UTF-8''([^;]+)/i); const plainName=disposition.match(/filename="?([^";]+)"?/i);
    const fileName=utfName?decodeURIComponent(utfName[1]):plainName?.[1]||'document';
    const objectUrl=URL.createObjectURL(blob); const anchor=document.createElement('a'); anchor.href=objectUrl; anchor.download=fileName; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(objectUrl);
}

export function unwrapData(payload){ return payload && typeof payload==='object' && 'data' in payload ? payload.data : payload; }
