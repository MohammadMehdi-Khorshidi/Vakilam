import { apiRequest, unwrapData } from './client';

const encodePathSegment = (value) => encodeURIComponent(String(value));

export async function getProvinces() {
    return unwrapData(await apiRequest('reference/provinces', { auth: false }));
}

export async function getCities(provinceId) {
    if (provinceId === undefined || provinceId === null || provinceId === '') return [];
    return unwrapData(await apiRequest(`reference/provinces/${encodePathSegment(provinceId)}/cities`, { auth: false }));
}

export async function getSpecialties() {
    return unwrapData(
        await apiRequest('reference/specialties', { auth: false }),
    );
}


export async function listLawyers(query = {}) {
    return unwrapData(await apiRequest('lawyers', { query, auth: false }));
}


export async function getLawyer(publicId) {
    if (publicId === undefined || publicId === null || publicId === '') {
        throw new Error('شناسه وکیل معتبر نیست.');
    }

    return unwrapData(
        await apiRequest(`lawyers/${encodePathSegment(publicId)}`, {
            auth: false,
        }),
    );
}
