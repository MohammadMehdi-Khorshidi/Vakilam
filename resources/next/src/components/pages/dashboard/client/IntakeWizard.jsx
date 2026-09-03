'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';
import { initialData, steps, titles, subtitles } from '@/lib/intake';
import {
    createLegalRequest,
    getLegalRequestDraft,
    selectServiceIntent,
    startMatching,
    submitLegalRequest,
    updateLegalRequest,
    uploadLegalRequestDocument,
} from '@/lib/api/legalRequests';

import IntakeProgress from './(legal-request)/IntakeProgress';
import IntakeNotice from './(legal-request)/IntakeNotice';
import IntakeActions from './(legal-request)/IntakeActions';
import IntakeStepper from './(legal-request)/IntakeStepper';
import StepDescription from './(legal-request)/steps/StepDescription';
import StepCategory from './(legal-request)/steps/StepCategory';
import StepGuide from './(legal-request)/steps/StepGuide';
import StepAction from './(legal-request)/steps/StepAction';
import StepCity from './(legal-request)/steps/StepCity';
import StepUrgency from './(legal-request)/steps/StepUrgency';
import StepDocuments from './(legal-request)/steps/StepDocuments';
import StepPrivacy from './(legal-request)/steps/StepPrivacy';
import StepSummary from './(legal-request)/steps/StepSummary';
import StepConfirmation from './(legal-request)/steps/StepConfirmation';
import StepPath from './(legal-request)/steps/StepPath';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400', '500', '600', '700', '800'] });
const STORAGE_KEY = 'vakilam-intake';

function mapDraft(draft) {
    if (!draft) return {};
    return {
        legalRequestId: draft.id,
        legalRequestPublicId: draft.public_id,
        title: draft.title ?? '',
        description: draft.description ?? '',
        legal_category_id: draft.legal_category_id ?? draft.legal_category?.id ?? '',
        category: draft.legal_category?.name ?? '',
        province_id: draft.province_id ?? draft.province?.id ?? '',
        city_id: draft.city_id ?? draft.city?.id ?? '',
        city: draft.city?.name ?? '',
        urgency: draft.urgency ?? 'normal',
        path: draft.service_intent && draft.service_intent !== 'undecided' ? draft.service_intent : '',
        service_intent: draft.service_intent ?? 'undecided',
        documents: Array.isArray(draft.documents)
            ? draft.documents.map((doc) => ({ id: doc.id ?? doc.public_id, name: doc.title ?? doc.name ?? 'مدرک' }))
            : [],
    };
}

function payloadFromData(data, finalIntent = null) {
    return {
        title: data.title?.trim() || 'درخواست حقوقی',
        description: data.description?.trim() || '',
        legal_category_id: data.legal_category_id || null,
        province_id: data.province_id ? Number(data.province_id) : null,
        city_id: data.city_id ? Number(data.city_id) : null,
        urgency: data.urgency || 'normal',
        service_intent: finalIntent || data.service_intent || 'undecided',
    };
}

export default function IntakeWizard() {
    const router = useRouter();
    const [data, setData] = useState(initialData);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;
        async function hydrate() {
            try {
                const draft = await getLegalRequestDraft();
                if (!active) return;
                let local = null;
                try { local = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch {}
                if (draft) {
                    setData({ ...initialData, ...(local?.data || {}), ...mapDraft(draft) });
                    setStep(Math.min(Number(local?.step || 0), steps.length - 1));
                } else if (local?.data) {
                    setData({ ...initialData, ...local.data, legalRequestId: null, legalRequestPublicId: null });
                    setStep(Math.min(Number(local.step || 0), steps.length - 1));
                }
            } catch (err) {
                setError(err.message || 'دریافت پیش‌نویس ناموفق بود.');
            } finally {
                if (active) setLoading(false);
            }
        }
        hydrate();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (loading) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }));
    }, [data, step, loading]);

    function update(key, value) {
        setError('');
        setMessage('');
        setData((prev) => ({ ...prev, [key]: value }));
    }

    function validateForStep(currentStep) {
        if (currentStep >= 0 && !data.description?.trim()) return 'شرح مسئله را وارد کنید.';
        if (currentStep >= 1 && !data.legal_category_id) return 'دسته‌بندی حقوقی را انتخاب کنید.';
        if (currentStep >= 4 && (!data.province_id || !data.city_id)) return 'استان و شهر پرونده را انتخاب کنید.';
        if (currentStep >= 5 && !data.urgency) return 'میزان فوریت را مشخص کنید.';
        return '';
    }

    async function saveDraft(finalIntent = null) {
        const validation = validateForStep(step);
        if (validation) throw new Error(validation);

        const payload = payloadFromData(data, finalIntent);
        const saved = data.legalRequestId
            ? await updateLegalRequest(data.legalRequestId, payload)
            : await createLegalRequest(payload);

        if (!saved?.id) throw new Error('شناسه درخواست از سرور دریافت نشد.');
        const next = { ...data, ...mapDraft(saved), legalRequestId: saved.id, legalRequestPublicId: saved.public_id };
        setData(next);
        localStorage.setItem('legal_request_id', saved.id);
        return { saved, next };
    }

    async function next() {
        if (saving) return;
        setSaving(true); setError(''); setMessage('');
        try {
            // از همان مرحله اول Draft واقعی ساخته/به‌روزرسانی می‌شود.
            await saveDraft();
            setStep((current) => Math.min(current + 1, steps.length - 1));
            setMessage('پیش‌نویس ذخیره شد.');
        } catch (err) {
            setError(err.message || 'ذخیره پیش‌نویس ناموفق بود.');
        } finally { setSaving(false); }
    }

    function back() { setStep((current) => Math.max(0, current - 1)); }

    async function uploadDocument(file) {
        let requestId = data.legalRequestId;
        if (!requestId) {
            const { saved } = await saveDraft();
            requestId = saved.id;
        }
        const result = await uploadLegalRequestDocument(requestId, file);
        return result?.document ?? result?.data ?? result;
    }

    async function submit() {
        if (submitting) return;
        setSubmitting(true); setError(''); setMessage('');
        try {
            if (!data.path) throw new Error('مسیر بعدی را انتخاب کنید.');
            if (data.path === 'ai_assistant') throw new Error('دستیار هوش مصنوعی در API فعلی هنوز قابل انتخاب نیست.');

            const { saved } = await saveDraft(data.path);
            const submitted = await submitLegalRequest(saved.id);
            await selectServiceIntent(saved.id, data.path);

            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem('legal_request_id', saved.id);

            if (data.path === 'lawyer_selection') {
                await startMatching(saved.id);
                router.push(`/client/lawyersAdmin?legal_request=${encodeURIComponent(saved.id)}`);
                return;
            }

            setMessage('درخواست ثبت و مسیر مشاوره فعال شد.');
            router.push(`/client?legal_request=${encodeURIComponent(submitted.id || saved.id)}`);
        } catch (err) {
            setError(err.message || 'ثبت نهایی درخواست ناموفق بود.');
        } finally { setSubmitting(false); }
    }

    if (loading) {
        return <div dir="rtl" className={`${vazir.className} grid min-h-[60vh] place-items-center text-sm font-bold text-[#183b34]`}>در حال دریافت پیش‌نویس...</div>;
    }

    return (
        <div dir="rtl" className={`${vazir.className} mt-20 min-h-screen w-full overflow-x-hidden bg-[#f8faf9]`}>
            <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                <div dir="rtl" className="mb-6 text-sm text-slate-500">خانه / <b className="mr-1 text-[#183b34]">راهنمای تشکیل پرونده</b></div>
                <div className="grid gap-6 xl:grid-cols-[1fr_245px]">
                    <section>
                        <IntakeProgress step={step} setStep={setStep}/>
                        <div dir="rtl" className="mb-7 text-center">
                            <div className="mb-2 text-sm font-bold text-[#9a761f]">مرحله {step + 1} از {steps.length}</div>
                            <h1 className="text-2xl font-black text-[#183b34] md:text-4xl">{titles[step]}</h1>
                            <p className="mt-3 text-sm text-slate-500">{subtitles[step]}</p>
                        </div>
                        <div dir="rtl" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                            <IntakeNotice/>
                            <StepRenderer step={step} data={data} update={update} onUpload={uploadDocument}/>
                            {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}
                            {message ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</div> : null}
                            <IntakeActions step={step} totalSteps={steps.length} onBack={back} onNext={next} onSubmit={submit} disabled={saving || submitting} isSubmitting={submitting}/>
                        </div>
                    </section>
                    <IntakeStepper step={step} setStep={setStep}/>
                </div>
            </main>
        </div>
    );
}

function StepRenderer({ step, data, update, onUpload }) {
    switch (step) {
        case 0: return <StepDescription data={data} update={update}/>;
        case 1: return <StepCategory data={data} update={update}/>;
        case 2: return <StepGuide data={data} update={update}/>;
        case 3: return <StepAction data={data} update={update}/>;
        case 4: return <StepCity data={data} update={update}/>;
        case 5: return <StepUrgency data={data} update={update}/>;
        case 6: return <StepDocuments data={data} update={update} onUpload={onUpload}/>;
        case 7: return <StepPrivacy data={data} update={update}/>;
        case 8: return <StepSummary data={data}/>;
        case 9: return <StepConfirmation data={data} update={update}/>;
        case 10: return <StepPath data={data} update={update}/>;
        default: return null;
    }
}
