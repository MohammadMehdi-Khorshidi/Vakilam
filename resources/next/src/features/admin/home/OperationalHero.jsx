import Link from 'next/link';

import { Bot, CreditCard, ShieldAlert, ShieldCheck } from 'lucide-react';

import HealthChart from './HealthChart';

export default function OperationalHero() {
    return (
        <section className="relative mt-8 overflow-hidden rounded-[28px] bg-[#0b382f] p-7 text-white shadow-[0_20px_55px_rgba(11,56,47,0.16)] md:p-10">
            <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full border border-[#cba753]/35" />

            <div className="pointer-events-none absolute -bottom-48 -right-32 h-96 w-96 rounded-full bg-[#1d5146]/20 blur-3xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_260px]">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#cba753]/35 bg-white/5 px-4 py-2 text-sm text-[#e2c477]">
                        <ShieldCheck size={16} />
                        کنترل عملیاتی
                    </span>

                    <h2 className="mt-6 text-3xl font-black leading-[1.5] md:text-4xl">
                        سامانه در وضعیت پایدار قرار دارد
                    </h2>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">
                        صف‌های احراز، قرارداد، تسویه، امنیت و کنترل خروجی‌های
                        هوش مصنوعی در این بخش پایش می‌شوند.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-x-7 gap-y-4 text-sm">
                        <span className="flex items-center gap-2 text-white/70">
                            <ShieldAlert size={16} className="text-[#d8b558]" />
                            هشدار امنیتی
                            <b className="text-white">۲ مورد باز</b>
                        </span>

                        <span className="flex items-center gap-2 text-white/70">
                            <Bot size={16} className="text-[#d8b558]" />
                            خطای هوش مصنوعی
                            <b className="text-white">۳ مورد</b>
                        </span>

                        <span className="flex items-center gap-2 text-white/70">
                            <CreditCard size={16} className="text-[#d8b558]" />
                            تسویه آماده
                            <b className="text-white">۸ مورد</b>
                        </span>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            href="/admin/verifications"
                            className="rounded-xl bg-[#d2ad5a] px-6 py-3 text-sm font-bold text-[#17352f] shadow-[0_10px_25px_rgba(210,173,90,0.22)] transition hover:bg-[#e1bd6c]"
                        >
                            بررسی صف احراز
                        </Link>

                        <Link
                            href="/admin/security/events"
                            className="rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold transition hover:bg-white/10"
                        >
                            رویدادهای امنیتی
                        </Link>
                    </div>
                </div>

                <HealthChart value={91} title="سلامت عملیاتی" />
            </div>
        </section>
    );
}
