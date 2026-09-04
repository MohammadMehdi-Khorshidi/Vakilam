import { apiRequest, unwrapData } from './client';

const encodePathSegment = (value) => encodeURIComponent(String(value));

const firstDefined = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== '');

const numberOr = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

function normalizeLawyer(lawyer) {
    const verificationStatus = firstDefined(
        lawyer.verificationStatus,
        lawyer.verification_status,
        lawyer.status,
        lawyer.is_available ? 'verified' : undefined,
        'pending',
    );

    return {
        ...lawyer,
        id: firstDefined(lawyer.id, lawyer.public_id, lawyer.lawyer_id),
        name: firstDefined(lawyer.name, lawyer.full_name, 'بدون نام'),
        licenseNumber: firstDefined(
            lawyer.licenseNumber,
            lawyer.license_number,
            lawyer.bar_number,
            '—',
        ),
        verificationStatus:
            verificationStatus === 'approved'
                ? 'verified'
                : verificationStatus,
        trustScore:
            firstDefined(lawyer.trustScore, lawyer.trust_score) ??
            (lawyer.average_rating === null
                ? null
                : numberOr(lawyer.average_rating, null)),
        activeCases: numberOr(
            firstDefined(lawyer.activeCases, lawyer.active_cases),
            0,
        ),
    };
}

export async function getProvinces() {
    return unwrapData(
        await apiRequest('reference/provinces', { auth: false }),
    );
}

export async function getCities(provinceId) {
    if (provinceId === undefined || provinceId === null || provinceId === '') {
        return [];
    }

    return unwrapData(
        await apiRequest(
            `reference/provinces/${encodePathSegment(provinceId)}/cities`,
            { auth: false },
        ),
    );
}

export async function listLawyers(filters = {}) {
    const payload = await apiRequest('lawyers', {
        auth: false,
        query: {
            specialty_id: firstDefined(
                filters.specialtyId,
                filters.specialty_id,
            ),
            province_id: firstDefined(filters.provinceId, filters.province_id),
            city_id: firstDefined(filters.cityId, filters.city_id),
            per_page: firstDefined(filters.perPage, filters.per_page),
            page: filters.page,
        },
    });

    if (Array.isArray(payload)) {
        return payload.map(normalizeLawyer);
    }

    if (Array.isArray(payload?.data)) {
        return {
            ...payload,
            data: payload.data.map(normalizeLawyer),
        };
    }

    return payload;
}

export async function getLawyer(publicId) {
    const payload = await apiRequest(
        `lawyers/${encodePathSegment(publicId)}`,
        { auth: false },
    );

    return payload?.lawyer ?? unwrapData(payload);
}
