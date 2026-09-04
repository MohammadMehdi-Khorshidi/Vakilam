'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { Vazirmatn } from 'next/font/google';

import { initialData, steps, titles, subtitles } from '@/lib/intake';
import { getLegalRequest } from '@/lib/api/legalRequests';
import IntakeProgress from '@/features/client/suggestions/CaseProgress';
import IntakeNotice from '../../../features/client/legal-request/IntakeNotice';
import IntakeActions from '../../../features/client/legal-request/IntakeActions';
import IntakeStepper from '../../../features/client/legal-request/IntakeStepper';
import StepDescription from '../../../features/client/legal-request/steps/StepDescription';
import StepCategory from '../../../features/client/legal-request/steps/StepCategory';
import StepGuide from '../../../features/client/legal-request/steps/StepGuide';
import StepAction from '../../../features/client/legal-request/steps/StepAction';
import StepCity from '../../../features/client/legal-request/steps/StepCity';
import StepUrgency from '../../../features/client/legal-request/steps/StepUrgency';
import StepDocuments from '../../../features/client/legal-request/steps/StepDocuments';
import StepPrivacy from '../../../features/client/legal-request/steps/StepPrivacy';
import StepSummary from '../../../features/client/legal-request/steps/StepSummary';
import StepConfirmation from '../../../features/client/legal-request/steps/StepConfirmation';
import StepPath from '../../../features/client/legal-request/steps/StepPath';



const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const STORAGE_KEY = 'vakilam-intake';

const DEFAULT_INTAKE = {
    data: initialData,
    step: 0,
};

let cachedStorageValue = null;
let cachedIntakeSnapshot = DEFAULT_INTAKE;

/*
|--------------------------------------------------------------------------
| Local storage
|--------------------------------------------------------------------------
*/

function getStoredIntake() {
    if (typeof window === 'undefined') {
        return DEFAULT_INTAKE;
    }

    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            cachedStorageValue = null;
            cachedIntakeSnapshot = DEFAULT_INTAKE;

            return cachedIntakeSnapshot;
        }

        if (saved === cachedStorageValue) {
            return cachedIntakeSnapshot;
        }

        const parsed = JSON.parse(saved);

        const parsedStep = typeof parsed?.step === 'number' ? parsed.step : 0;

        const safeStep = Math.min(Math.max(parsedStep, 0), steps.length - 1);

        cachedStorageValue = saved;

        cachedIntakeSnapshot = {
            data: {
                ...initialData,
                ...(parsed?.data ?? {}),
            },
            step: safeStep,
        };

        return cachedIntakeSnapshot;
    } catch {
        return DEFAULT_INTAKE;
    }
}

function getServerSnapshot() {
    return DEFAULT_INTAKE;
}

function subscribeToStorage(callback) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handleStorage = (event) => {
        if (event.key === STORAGE_KEY || event.key === null) {
            callback();
        }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener('storage', handleStorage);
    };
}

function useStoredIntake() {
    return useSyncExternalStore(
        subscribeToStorage,
        getStoredIntake,
        getServerSnapshot,
    );
}

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

function getAuthToken() {
    if (typeof window === 'undefined') {
        return null;
    }

    const directTokenKeys = [
        'auth_token',
        'access_token',
        'token',
        'vakilam_token',
    ];

    for (const key of directTokenKeys) {
        const value = window.localStorage.getItem(key);

        if (value) {
            return value.replace(/^Bearer\s+/i, '');
        }
    }

    const jsonKeys = ['auth', 'vakilam-auth', 'user'];

    for (const key of jsonKeys) {
        const value = window.localStorage.getItem(key);

        if (!value) {
            continue;
        }

        try {
            const parsed = JSON.parse(value);

            const token =
                parsed?.token ??
                parsed?.access_token ??
                parsed?.auth_token ??
                parsed?.data?.token ??
                parsed?.data?.access_token;

            if (token) {
                return String(token).replace(/^Bearer\s+/i, '');
            }
        } catch {
            // مقدار موردنظر JSON نیست.
        }
    }

    return null;
}


function createHeaders() {
    const token = getAuthToken();

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

/*
|--------------------------------------------------------------------------
| API helpers
|--------------------------------------------------------------------------
*/

async function parseResponse(response) {
    let result = null;

    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (response.status === 401) {
        throw new Error(
            'توکن ورود معتبر نیست یا منقضی شده است. دوباره وارد حساب کاربری شوید.',
        );
    }

    return result;
}

async function getLegalRequestDraft() {
    const token = getAuthToken();

    if (!token) {
        throw new Error('توکن ورود پیدا نشد. ابتدا وارد حساب کاربری شوید.');
    }

    const response = await fetch(`${API_BASE_URL}/legal-requests/draft`, {
        method: 'GET',

        headers: createHeaders(),

        credentials: 'include',

        cache: 'no-store',
    });

    const result = await parseResponse(response);

    /*
     * اگر پیش‌نویس وجود نداشته باشد، فرم خالی می‌ماند.
     */
    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(result?.message || 'دریافت پیش‌نویس انجام نشد.');
    }

    return result?.data ?? result;
}

async function createLegalRequest(payload) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('توکن ورود پیدا نشد. ابتدا وارد حساب کاربری شوید.');
    }

    const response = await fetch(`${API_BASE_URL}/legal-requests`, {
        method: 'POST',

        headers: createHeaders(),

        credentials: 'include',

        body: JSON.stringify(payload),
    });

    const result = await parseResponse(response);

    if (response.status === 422) {
        const validationMessages = Object.values(result?.errors ?? {})
            .flat()
            .filter(Boolean);

        const error = new Error(result?.message || 'اطلاعات فرم معتبر نیست.');

        error.validationMessages = validationMessages;

        throw error;
    }

    if (!response.ok) {
        throw new Error(result?.message || 'ثبت درخواست انجام نشد.');
    }

    return result?.data ?? result;
}

/*
|--------------------------------------------------------------------------
| Payload helpers
|--------------------------------------------------------------------------
*/

function getItemId(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }

    return value.id ?? value.value ?? value.code ?? null;
}

function createLegalRequestPayload(data) {
    return {
        title:
            data.title ||
            data.subject ||
            data.caseTitle ||
            'درخواست حقوقی موکل',

        description:
            data.description || data.problemDescription || data.details || '',

        legal_category_id: getItemId(
            data.legal_category_id ?? data.categoryId ?? data.category,
        ),

        province_id: getItemId(
            data.province_id ?? data.provinceId ?? data.province,
        ),

        city_id: getItemId(data.city_id ?? data.cityId ?? data.city),

        urgency: data.urgency?.value ?? data.urgency ?? 'normal',

        service_intent:
            data.service_intent ??
            data.serviceIntent ??
            data.path?.value ??
            data.path ??
            null,
    };
}

function mapDraftToIntake(draft) {
    if (!draft) {
        return {};
    }

    return {
        title: draft.title ?? '',
        subject: draft.title ?? '',

        description: draft.description ?? '',

        problemDescription: draft.description ?? '',

        legal_category_id: draft.legal_category_id ?? null,

        category:
            draft.legal_category ??
            draft.category ??
            draft.legal_category_id ??
            null,

        province_id: draft.province_id ?? null,

        province: draft.province ?? draft.province_id ?? null,

        city_id: draft.city_id ?? null,

        city: draft.city ?? draft.city_id ?? null,

        urgency: draft.urgency ?? 'normal',

        service_intent: draft.service_intent ?? null,

        path: draft.service_intent ?? null,
    };
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function IntakeWizard() {
    const storedIntake = useStoredIntake();

    const [data, setData] = useState(() => storedIntake.data);

    const [step, setStep] = useState(() => storedIntake.step);

    const [isLoadingDraft, setIsLoadingDraft] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [message, setMessage] = useState('');

    const [error, setError] = useState('');

    const [validationErrors, setValidationErrors] = useState([]);

    /*
     * دریافت پیش‌نویس از Laravel
     */
    useEffect(() => {
        let isActive = true;

        async function loadDraft() {
            setIsLoadingDraft(true);
            setError('');

            try {
                const draft = await getLegalRequestDraft();

                if (!isActive || !draft) {
                    return;
                }

                setData((previousData) => {
                    const nextData = {
                        ...previousData,
                        ...mapDraftToIntake(draft),
                        legalRequestId: draft.id ?? previousData.legalRequestId,
                        legalRequestPublicId:
                            draft.public_id ??
                            previousData.legalRequestPublicId,
                    };

                    saveIntakeToStorage(nextData, step);

                    return nextData;
                });
            } catch (requestError) {
                if (!isActive) {
                    return;
                }

                setError(
                    requestError?.message || 'دریافت پیش‌نویس با خطا مواجه شد.',
                );
            } finally {
                if (isActive) {
                    setIsLoadingDraft(false);
                }
            }
        }

        loadDraft();

        return () => {
            isActive = false;
        };
    }, []);

    function saveIntakeToStorage(nextData, nextStep) {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const serialized = JSON.stringify({
                data: nextData,
                step: nextStep,
            });

            window.localStorage.setItem(STORAGE_KEY, serialized);

            cachedStorageValue = serialized;

            cachedIntakeSnapshot = {
                data: nextData,
                step: nextStep,
            };
        } catch {
            // خطای localStorage نادیده گرفته می‌شود.
        }
    }

    const updateData = (key, value) => {
        setError('');
        setMessage('');
        setValidationErrors([]);

        setData((previousData) => {
            const nextData = {
                ...previousData,
                [key]: value,
            };

            saveIntakeToStorage(nextData, step);

            return nextData;
        });
    };

    const changeStep = (nextStep) => {
        const safeStep = Math.min(Math.max(nextStep, 0), steps.length - 1);

        setStep(safeStep);

        saveIntakeToStorage(data, safeStep);
    };

    const next = () => {
        changeStep(step + 1);
    };

    const back = () => {
        changeStep(step - 1);
    };

    /*
     * ثبت درخواست
     */
    const submitIntake = async () => {
        if (isSubmitting) {
            return;
        }

        setError('');
        setMessage('');
        setValidationErrors([]);
        setIsSubmitting(true);

        try {
            const payload = createLegalRequestPayload(data);

            const legalRequest = await createLegalRequest(payload);

            const nextData = {
                ...data,

                legalRequestId: legalRequest?.id ?? data.legalRequestId,

                legalRequestPublicId:
                    legalRequest?.public_id ?? data.legalRequestPublicId,
            };

            setData(nextData);

            saveIntakeToStorage(nextData, step);

            setMessage('درخواست حقوقی با موفقیت ثبت شد.');

            console.log('Legal request:', legalRequest);
        } catch (requestError) {
            setError(requestError?.message || 'ثبت درخواست انجام نشد.');

            setValidationErrors(requestError?.validationMessages ?? []);

            console.error(requestError);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let active = true;

        async function loadLegalRequest() {
            try {
                const legalRequestId = localStorage.getItem('legal_request_id');

                if (!legalRequestId) {
                    return;
                }

                const legalRequest = await getLegalRequest(legalRequestId);

                if (!active) {
                    return;
                }

                setData((previousData) => ({
                    ...previousData,
                    ...legalRequest,
                }));
            } catch (requestError) {
                if (!active) {
                    return;
                }

                setError(requestError?.message || 'دریافت درخواست ناموفق بود.');
            }
        }

        loadLegalRequest();

        return () => {
            active = false;
        };
    }, []);
    return (
        <div
            dir="ltr"
            className={`${vazir.className} mt-15 min-h-screen bg-[#f8faf9] lg:pr-72`}
        >
            <main className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
                <div dir="rtl" className="mb-6 text-sm text-slate-500">
                    خانه /
                    <b className="mr-1 text-[#183b34]">راهنمای تشکیل پرونده</b>
                </div>

                {isLoadingDraft ? (
                    <div
                        dir="rtl"
                        className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700"
                    >
                        در حال دریافت پیش‌نویس درخواست...
                    </div>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[1fr_245px]">
                    <section>
                        <IntakeProgress step={step} setStep={changeStep} />

                        <div dir="rtl" className="mb-7 text-center">
                            <div className="mb-2 text-sm font-bold text-[#9a761f]">
                                مرحله {step + 1} از {steps.length}
                            </div>

                            <h1 className="text-2xl font-black text-[#183b34] md:text-4xl">
                                {titles[step]}
                            </h1>

                            <p className="mt-3 text-sm text-slate-500">
                                {subtitles[step]}
                            </p>
                        </div>

                        <div
                            dir="rtl"
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
                        >
                            <IntakeNotice />

                            <StepRenderer
                                step={step}
                                data={data}
                                update={updateData}
                            />

                            {error ? (
                                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
                                    {error}
                                </div>
                            ) : null}

                            {validationErrors.length > 0 ? (
                                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                    <p className="text-sm font-black text-amber-800">
                                        موارد زیر را اصلاح کنید:
                                    </p>

                                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-700">
                                        {validationErrors.map((item, index) => (
                                            <li key={`${item}-${index}`}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {message ? (
                                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                                    {message}
                                </div>
                            ) : null}

                            <IntakeActions
                                step={step}
                                totalSteps={steps.length}
                                onBack={back}
                                onNext={next}
                                onSubmit={submitIntake}
                                isSubmitting={isSubmitting}
                                disabled={isSubmitting || isLoadingDraft}
                            />

                            {isSubmitting ? (
                                <p className="mt-3 text-center text-xs font-bold text-slate-500">
                                    در حال ثبت درخواست...
                                </p>
                            ) : null}
                        </div>
                    </section>

                    <IntakeStepper step={step} setStep={changeStep} />
                </div>
            </main>
        </div>
    );
}

function StepRenderer({ step, data, update }) {
    switch (step) {
        case 0:
            return <StepDescription data={data} update={update} />;

        case 1:
            return <StepCategory data={data} update={update} />;

        case 2:
            return <StepGuide data={data} update={update} />;

        case 3:
            return <StepAction data={data} update={update} />;

        case 4:
            return <StepCity data={data} update={update} />;

        case 5:
            return <StepUrgency data={data} update={update} />;

        case 6:
            return <StepDocuments data={data} update={update} />;

        case 7:
            return <StepPrivacy data={data} update={update} />;

        case 8:
            return <StepSummary data={data} />;

        case 9:
            return <StepConfirmation data={data} update={update} />;

        case 10:
            return <StepPath data={data} update={update} />;

        default:
            return null;
    }
}
