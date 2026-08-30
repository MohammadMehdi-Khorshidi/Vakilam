'use client';

import { AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

import SecurityRuleCard from '@/components/pages/dashboard/lawyer/(security)/SecurityRuleCard';
import { securityRules } from '@/components/pages/dashboard/lawyer/(security)/securityRules';

export default function SecurityPage() {
    const [showWarning, setShowWarning] = useState(false);

    const [registeredEvent, setRegisteredEvent] = useState(null);

    function handleRegisterWarning() {
        const event = {
            id: `SEC-${Date.now()}`,
            type: 'bypass_warning_test',
            status: 'registered',
            createdAt: new Date().toISOString(),
        };

        const storageKey = 'vakilam-security-events';

        try {
            const currentEvents = JSON.parse(
                window.localStorage.getItem(storageKey) ?? '[]',
            );

            window.localStorage.setItem(
                storageKey,
                JSON.stringify([event, ...currentEvents]),
            );
        } catch {
            window.localStorage.setItem(storageKey, JSON.stringify([event]));
        }

        setRegisteredEvent(event);
        setShowWarning(false);
    }

    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <header className="mb-8 pt-4">
                <div className="flex items-center gap-3">
                    <span className="h-px w-7 bg-[#c99f42]" />

                    <p className="text-sm font-bold text-[#a47b2c]">
                        امنیت و محرمانگی
                    </p>
                </div>

                <h1 className="mt-5 text-3xl font-black leading-tight text-[#0b302b] sm:text-4xl">
                    قواعد دسترسی و ارتباط
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#75847f]">
                    حفظ محرمانگی و جلوگیری از دور زدن سامانه بخشی از شرایط
                    همکاری وکیل است.
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {securityRules.map((rule) => (
                    <SecurityRuleCard key={rule.id} rule={rule} />
                ))}
            </section>

            {registeredEvent && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div>
                        <strong className="text-sm text-emerald-800">
                            رویداد آزمایشی ثبت شد
                        </strong>

                        <p className="mt-1 text-xs text-emerald-700">
                            شناسه رویداد: {registeredEvent.id}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-5 flex justify-end">
                <button
                    type="button"
                    onClick={() => setShowWarning(true)}
                    className="rounded-xl border border-[#d8b45d] bg-[#fffaf0] px-5 py-3 text-sm font-bold text-[#183d36] transition hover:bg-[#fff5dc]"
                >
                    آزمایش هشدار دور زدن
                </button>
            </div>

            {showWarning && (
                <SecurityWarningModal
                    onClose={() => setShowWarning(false)}
                    onConfirm={handleRegisterWarning}
                />
            )}
        </div>
    );
}

function SecurityWarningModal({ onClose, onConfirm }) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
            onMouseDown={onClose}
        >
            <section
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                            <AlertTriangle size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#123b34]">
                                هشدار دور زدن سامانه
                            </h2>

                            <p className="mt-2 text-sm leading-7 text-[#657571]">
                                ارسال اطلاعات تماس یا پیشنهاد پرداخت خارج از
                                وکیلم می‌تواند به‌عنوان رویداد امنیتی ثبت شود.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="بستن"
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#dce6e2]"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#dce6e2] px-5 py-3 text-sm font-bold text-[#52635e]"
                    >
                        انصراف
                    </button>

                    <Link
                        href="/lawyer/negotiation"
                        className="inline-flex rounded-xl border border-[#d8b45d] bg-[#fffaf0] px-5 py-3 text-sm font-bold text-[#183d36] transition hover:bg-[#fff5dc]"
                    >
                        آزمایش هشدار دور زدن
                    </Link>
                </div>
            </section>
        </div>
    );
}
