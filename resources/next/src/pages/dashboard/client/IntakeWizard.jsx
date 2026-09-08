'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import {
    categories,
    initialData,
    normalizeCategoryCode,
    normalizeServiceIntent,
    normalizeUrgencyValue,
    steps,
    subtitles,
    titles,
} from '@/lib/intake';
import {
    createLegalRequestDraft,
    getCurrentDraft,
    submitLegalRequest,
    updateLegalRequestDraft,
} from '@/lib/api/legalRequests';
import IntakeProgress from '@/features/client/suggestions/CaseProgress';
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

const STORAGE_KEY = 'vakilam-intake';
const VALID_URGENCIES = new Set(['low', 'normal', 'high', 'urgent']);
const VALID_SERVICE_INTENTS = new Set(['consultation', 'lawyer_selection']);
const VALID_CATEGORY_CODES = new Set(categories.map((item) => item.id));

const DEFAULT_INTAKE = {
    data: initialData,
    step: 0,
};

let cachedStorageValue = null;
let cachedIntakeSnapshot = DEFAULT_INTAKE;

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
    return () => window.removeEventListener('storage', handleStorage);
}

function useStoredIntake() {
    return useSyncExternalStore(
        subscribeToStorage,
        getStoredIntake,
        getServerSnapshot,
    );
}

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
    const categoryCode = normalizeCategoryCode(data.category);
    const legalCategory =
        getItemId(data.legal_category_id ?? data.categoryId) ||
        categoryCode ||
        null;

    const pathValue = normalizeServiceIntent(
        data.path || data.service_intent || data.serviceIntent,
    );

    return {
        title:
            String(data.title || data.subject || data.caseTitle || '').trim() ||
            'درخواست حقوقی موکل',
        description: String(
            data.description || data.problemDescription || data.details || '',
        ).trim(),
        legal_category_id: legalCategory,
        province_id: getItemId(data.province_id ?? data.provinceId),
        city_id: getItemId(data.city_id ?? data.cityId),
        urgency: normalizeUrgencyValue(data.urgency),
        service_intent: pathValue || 'undecided',
    };
}

function mapDraftToIntake(draft) {
    if (!draft) return {};

    const serviceIntent = normalizeServiceIntent(draft.service_intent);
    const mapped = {
        title: draft.title ?? '',
        subject: draft.title ?? '',
        description: draft.description ?? '',
        problemDescription: draft.description ?? '',
        legal_category_id: draft.legal_category_id ?? null,
        province_id: draft.province_id ?? null,
        city_id: draft.city_id ?? null,
        urgency: normalizeUrgencyValue(draft.urgency ?? 'normal'),
        service_intent: serviceIntent || null,
        path: VALID_SERVICE_INTENTS.has(serviceIntent) ? serviceIntent : '',
    };

    if (draft.legal_category?.code) {
        mapped.category = normalizeCategoryCode(draft.legal_category.code);
    }

    if (draft.province?.name) {
        mapped.province = draft.province.name;
    }

    if (draft.city?.name) {
        mapped.city = draft.city.name;
    }

    return mapped;
}

function validationMessagesForStep(step, data) {
    const errors = [];

    if (step === 0 && !String(data.description || '').trim()) {
        errors.push('شرح مسئله را وارد کنید.');
    }

    if (step === 1) {
        const categoryCode = normalizeCategoryCode(data.category);
        if (!data.legal_category_id && !VALID_CATEGORY_CODES.has(categoryCode)) {
            errors.push('لطفاً دسته‌بندی مسئله را انتخاب کنید.');
        }
    }

    if (step === 2 && !String(data.answer || '').trim()) {
        errors.push('لطفاً مشخص کنید آیا مدرک یا مستند مرتبط دارید.');
    }

    if (step === 4) {
        if (!data.province_id) {
            errors.push('استان پرونده را انتخاب کنید.');
        }
        if (!data.city_id || !data.city) {
            errors.push('شهر پرونده را انتخاب کنید.');
        }
    }

    if (
        step === 5 &&
        !VALID_URGENCIES.has(normalizeUrgencyValue(data.urgency))
    ) {
        errors.push('لطفاً میزان فوریت مسئله را انتخاب کنید.');
    }

    if (step === 7 && !String(data.privacy || '').trim()) {
        errors.push('لطفاً سطح محرمانگی پرونده را انتخاب کنید.');
    }

    if (step === 9 && !data.confirmed) {
        errors.push('برای ادامه، تأیید نهایی اطلاعات را فعال کنید.');
    }

    if (
        step === 10 &&
        !VALID_SERVICE_INTENTS.has(normalizeServiceIntent(data.path))
    ) {
        errors.push('یکی از مسیرهای فعال ادامه پرونده را انتخاب کنید.');
    }

    return errors;
}

function finalValidationMessages(data) {
    return [0, 1, 2, 4, 5, 7, 9, 10].flatMap((step) =>
        validationMessagesForStep(step, data),
    );
}

export default function IntakeWizard() {
    const router = useRouter();
    const storedIntake = useStoredIntake();
    const [data, setData] = useState(() => storedIntake.data);
    const [step, setStep] = useState(() => storedIntake.step);
    const [isLoadingDraft, setIsLoadingDraft] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);

    useEffect(() => {
        let isActive = true;

        async function loadDraft() {
            setIsLoadingDraft(true);
            setError('');

            try {
                const draft = await getCurrentDraft();

                if (!isActive) return;

                if (!draft) {
                    setData((previousData) => {
                        const nextData = { ...previousData };
                        delete nextData.legalRequestId;
                        delete nextData.legalRequestPublicId;
                        saveIntakeToStorage(nextData, step);
                        return nextData;
                    });

                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('legal_request_id');
                    }

                    return;
                }

                setData((previousData) => {
                    const nextData = {
                        ...previousData,
                        ...mapDraftToIntake(draft),
                        legalRequestId: draft.id ?? previousData.legalRequestId,
                        legalRequestPublicId:
                            draft.public_id ?? previousData.legalRequestPublicId,
                    };

                    saveIntakeToStorage(nextData, step);
                    return nextData;
                });
            } catch (requestError) {
                if (isActive) {
                    setError(
                        requestError?.message ||
                            'دریافت پیش‌نویس با خطا مواجه شد.',
                    );
                }
            } finally {
                if (isActive) setIsLoadingDraft(false);
            }
        }

        loadDraft();
        return () => {
            isActive = false;
        };
    }, []);

    function saveIntakeToStorage(nextData, nextStep) {
        if (typeof window === 'undefined') return;

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
            // localStorage can be unavailable in restricted browsers.
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

    const showStepErrors = (messages) => {
        setError('');
        setValidationErrors(messages);
    };

    const next = () => {
        const errors = validationMessagesForStep(step, data);
        if (errors.length > 0) {
            showStepErrors(errors);
            return;
        }

        setError('');
        setValidationErrors([]);
        changeStep(step + 1);
    };

    const back = () => {
        setError('');
        setValidationErrors([]);
        changeStep(step - 1);
    };

    const navigateToStep = (nextStep) => {
        if (nextStep <= step) {
            changeStep(nextStep);
            return;
        }

        if (nextStep === step + 1) {
            next();
            return;
        }

        setError('مراحل را به ترتیب تکمیل کنید.');
        setValidationErrors([]);
    };

    const submitIntake = async () => {
        if (isSubmitting) return;

        const clientErrors = finalValidationMessages(data);
        if (clientErrors.length > 0) {
            setError('');
            setValidationErrors(clientErrors);
            return;
        }

        setError('');
        setMessage('');
        setValidationErrors([]);
        setIsSubmitting(true);

        try {
            const payload = createLegalRequestPayload(data);
            let draft;

            if (data.legalRequestId) {
                draft = await updateLegalRequestDraft(
                    data.legalRequestId,
                    payload,
                );
            } else {
                draft = await createLegalRequestDraft(payload);

                if (!draft?.id) {
                    throw new Error('شناسه پیش‌نویس از سرور دریافت نشد.');
                }

                draft = await updateLegalRequestDraft(draft.id, payload);
            }

            if (!draft?.id) {
                throw new Error('پیش‌نویس درخواست معتبر نیست.');
            }

            const submitted =
                draft.status === 'submitted'
                    ? draft
                    : await submitLegalRequest(draft.id);

            const nextData = {
                ...data,
                ...mapDraftToIntake(submitted),
                legalRequestId: submitted?.id ?? draft.id,
                legalRequestPublicId:
                    submitted?.public_id ?? draft.public_id ?? null,
            };

            setData(nextData);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(
                    'legal_request_id',
                    String(nextData.legalRequestId),
                );
                window.localStorage.removeItem(STORAGE_KEY);
                cachedStorageValue = null;
                cachedIntakeSnapshot = DEFAULT_INTAKE;
            }

            if (submitted?.service_intent === 'lawyer_selection') {
                router.push(
                    `/client/lawyersAdmin?legal_request_id=${encodeURIComponent(
                        submitted.id,
                    )}`,
                );
                return;
            }

            setMessage('درخواست حقوقی با موفقیت ثبت نهایی شد.');
        } catch (requestError) {
            const serverValidation = requestError?.validationMessages ?? [];

            if (serverValidation.length > 0) {
                setError('');
                setValidationErrors(serverValidation);
            } else {
                setError(requestError?.message || 'ثبت درخواست انجام نشد.');
                setValidationErrors([]);
            }

            console.error(requestError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            dir="ltr"
            className={`${vazir.className} mt-15 min-h-screen bg-[#f8faf9]`}
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
                        <IntakeProgress step={step} setStep={navigateToStep} />

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
                            <StepRenderer
                                step={step}
                                data={data}
                                update={updateData}
                                validationError={validationErrors[0] || ''}
                            />

                            {error && validationErrors.length === 0 ? (
                                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
                                    {error}
                                </div>
                            ) : null}

                            {validationErrors.length > 0 &&
                            ![1, 2, 4, 5, 7].includes(step) ? (
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
                        </div>
                    </section>

                    <IntakeStepper step={step} setStep={navigateToStep} />
                </div>
            </main>
        </div>
    );
}

function StepRenderer({ step, data, update, validationError }) {
    switch (step) {
        case 0:
            return <StepDescription data={data} update={update} />;
        case 1:
            return <StepCategory data={data} update={update} validationError={validationError} />;
        case 2:
            return <StepGuide data={data} update={update} validationError={validationError} />;
        case 3:
            return <StepAction data={data} update={update} />;
        case 4:
            return <StepCity data={data} update={update} validationError={validationError} />;
        case 5:
            return <StepUrgency data={data} update={update} validationError={validationError} />;
        case 6:
            return <StepDocuments data={data} update={update} />;
        case 7:
            return <StepPrivacy data={data} update={update} validationError={validationError} />;
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

