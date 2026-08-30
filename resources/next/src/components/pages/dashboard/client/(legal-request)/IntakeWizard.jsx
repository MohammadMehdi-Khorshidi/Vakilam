'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Menu, X } from 'lucide-react';

import { initialData, steps, titles, subtitles } from '@/lib/intake';

import IntakeProgress from './IntakeProgress';
import IntakeStepper from './IntakeStepper';
import IntakeNotice from './IntakeNotice';
import IntakeActions from './IntakeActions';

import StepDescription from './steps/StepDescription';
import StepCategory from './steps/StepCategory';
import StepGuide from './steps/StepGuide';
import StepAction from './steps/StepAction';
import StepCity from './steps/StepCity';
import StepUrgency from './steps/StepUrgency';
import StepDocuments from './steps/StepDocuments';
import StepPrivacy from './steps/StepPrivacy';
import StepSummary from './steps/StepSummary';
import StepConfirmation from './steps/StepConfirmation';
import StepPath from './steps/StepPath';

export default function IntakeWizard() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState(initialData);
    const [mobileNav, setMobileNav] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('vakilam-intake');

        if (!saved) return;

        try {
            const parsed = JSON.parse(saved);

        } catch {
            // ignore invalid localStorage data
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            'vakilam-intake',
            JSON.stringify({
                data,
                step,
            }),
        );
    }, [data, step]);

    const update = (key, value) => {
        setData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const next = () => {
        setStep((current) => Math.min(steps.length - 1, current + 1));
    };

    const back = () => {
        setStep((current) => Math.max(0, current - 1));
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] lg:pr-72">


            <main className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
                <div className="mb-6 text-sm text-slate-500">
                    خانه /
                    <b className="mr-1 text-[#183b34]">راهنمای تشکیل پرونده</b>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_245px]">
                    <section>
                        <IntakeProgress step={step} setStep={setStep} />

                        <div className="mb-7 text-center">
                            <div className="mb-2 text-sm font-bold text-[#9a761f]">
                                مرحله {step + 1} از {steps.length}
                            </div>

                            <h1 className="text-2xl font-black md:text-4xl">
                                {titles[step]}
                            </h1>

                            <p className="mt-3 text-sm text-slate-500">
                                {subtitles[step]}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                            <IntakeNotice />

                            <StepRenderer
                                step={step}
                                data={data}
                                update={update}
                            />

                            <IntakeActions
                                step={step}
                                totalSteps={steps.length}
                                onBack={back}
                                onNext={next}
                                onSubmit={() =>
                                    alert('درخواست آماده ارسال به API است')
                                }
                            />
                        </div>
                    </section>

                    <IntakeStepper step={step} setStep={setStep} />
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
