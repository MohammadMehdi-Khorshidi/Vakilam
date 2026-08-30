'use client';

import { useState, useSyncExternalStore } from 'react';
import { Vazirmatn } from 'next/font/google';

import { initialData, steps, titles, subtitles } from '@/lib/intake';

import IntakeProgress from '@/components/pages/dashboard/client/(legal-request)/IntakeProgress';
import IntakeNotice from '@/components/pages/dashboard/client/(legal-request)/IntakeNotice';
import IntakeActions from '@/components/pages/dashboard/client/(legal-request)/IntakeActions';
import IntakeStepper from '@/components/pages/dashboard/client/(legal-request)/IntakeStepper';

import StepDescription from '@/components/pages/dashboard/client/(legal-request)/steps/StepDescription';
import StepCategory from '@/components/pages/dashboard/client/(legal-request)/steps/StepCategory';
import StepGuide from '@/components/pages/dashboard/client/(legal-request)/steps/StepGuide';
import StepAction from '@/components/pages/dashboard/client/(legal-request)/steps/StepAction';
import StepCity from '@/components/pages/dashboard/client/(legal-request)/steps/StepCity';
import StepUrgency from './(legal-request)/steps/StepUrgency';
import StepDocuments from './(legal-request)/steps/StepDocuments';
import StepPrivacy from './(legal-request)/steps/StepPrivacy';
import StepSummary from './(legal-request)/steps/StepSummary';
import StepConfirmation from './(legal-request)/steps/StepConfirmation';
import StepPath from './(legal-request)/steps/StepPath';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const STORAGE_KEY = 'vakilam-intake';

function getStoredIntake() {
    if (typeof window === 'undefined') {
        return {
            data: initialData,
            step: 0,
        };
    }

    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                data: initialData,
                step: 0,
            };
        }

        const parsed = JSON.parse(saved);

        return {
            data: parsed?.data ?? initialData,
            step:
                typeof parsed?.step === 'number'
                    ? parsed.step
                    : 0,
        };
    } catch {
        return {
            data: initialData,
            step: 0,
        };
    }
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
        window.removeEventListener(
            'storage',
            handleStorage,
        );
    };
}

function getServerSnapshot() {
    return {
        data: initialData,
        step: 0,
    };
}

function useStoredIntake() {
    return useSyncExternalStore(
        subscribeToStorage,
        getStoredIntake,
        getServerSnapshot,
    );
}

export default function IntakeWizard() {
    const storedIntake = useStoredIntake();

    const [data, setData] = useState(
        () => storedIntake.data,
    );

    const [step, setStep] = useState(
        () => storedIntake.step,
    );

    const [mobileNav, setMobileNav] = useState(false);

    const update = (key, value) => {
        setData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const saveIntake = (nextData, nextStep) => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    data: nextData,
                    step: nextStep,
                }),
            );
        } catch {
            // Ignore localStorage errors.
        }
    };

    const updateData = (key, value) => {
        setData((prev) => {
            const nextData = {
                ...prev,
                [key]: value,
            };

            saveIntake(nextData, step);

            return nextData;
        });
    };

    const next = () => {
        setStep((currentStep) => {
            const nextStep = Math.min(
                steps.length - 1,
                currentStep + 1,
            );

            saveIntake(data, nextStep);

            return nextStep;
        });
    };

    const back = () => {
        setStep((currentStep) => {
            const previousStep = Math.max(
                0,
                currentStep - 1,
            );

            saveIntake(data, previousStep);

            return previousStep;
        });
    };

    return (
        <div
            dir="ltr"
            className={`${vazir.className} mt-15 min-h-screen bg-[#f8faf9] lg:pr-72`}
        >
            <main className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-slate-500">
                    خانه /
                    <b className="mr-1 text-[#183b34]">
                        راهنمای تشکیل پرونده
                    </b>
                </div>

                {/* Main Layout */}
                <div className="grid gap-6 xl:grid-cols-[1fr_245px]">
                    {/* Main Content */}
                    <section>
                        <IntakeProgress
                            step={step}
                            setStep={setStep}
                        />

                        {/* Page Title */}
                        <div className="mb-7 text-center">
                            <div className="mb-2 text-sm font-bold text-[#9a761f]">
                                مرحله {step + 1} از{' '}
                                {steps.length}
                            </div>

                            <h1 className="text-2xl font-black md:text-4xl">
                                {titles[step]}
                            </h1>

                            <p className="mt-3 text-sm text-slate-500">
                                {subtitles[step]}
                            </p>
                        </div>

                        {/* Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                            <IntakeNotice />

                            <StepRenderer
                                step={step}
                                data={data}
                                update={updateData}
                            />

                            <IntakeActions
                                step={step}
                                totalSteps={steps.length}
                                onBack={back}
                                onNext={next}
                                onSubmit={() =>
                                    alert(
                                        'درخواست آماده ارسال به API است',
                                    )
                                }
                            />
                        </div>
                    </section>

                    {/* Sidebar */}
                    <IntakeStepper
                        step={step}
                        setStep={setStep}
                    />
                </div>
            </main>
        </div>
    );
}

function StepRenderer({ step, data, update }) {
    switch (step) {
        case 0:
            return (
                <StepDescription
                    data={data}
                    update={update}
                />
            );

        case 1:
            return (
                <StepCategory
                    data={data}
                    update={update}
                />
            );

        case 2:
            return (
                <StepGuide
                    data={data}
                    update={update}
                />
            );

        case 3:
            return (
                <StepAction
                    data={data}
                    update={update}
                />
            );

        case 4:
            return (
                <StepCity
                    data={data}
                    update={update}
                />
            );

        case 5:
            return (
                <StepUrgency
                    data={data}
                    update={update}
                />
            );

        case 6:
            return (
                <StepDocuments
                    data={data}
                    update={update}
                />
            );

        case 7:
            return (
                <StepPrivacy
                    data={data}
                    update={update}
                />
            );

        case 8:
            return <StepSummary data={data} />;

        case 9:
            return (
                <StepConfirmation
                    data={data}
                    update={update}
                />
            );

        case 10:
            return (
                <StepPath
                    data={data}
                    update={update}
                />
            );

        default:
            return null;
    }
}
