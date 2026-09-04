'use client';

import ProfessionalProfileCard from './(Home)/ProfessionalProfileCard';
import DashboardStats from '@/components/pages/dashboard/client/(home)/DashboardStats';
import SuggestedCaseCard from './(Home)/SuggestedCaseCard';
import ActionCenter from './(Home)/ActionCenter';
import FeedbackCard from './(Home)/FeedbackCard';
import CooperationStatus from './(Home)/CooperationStatus';
import { Vazirmatn } from 'next/font/google';
import { useAuth } from '@/auth/AuthProvider';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export default function LawyerDashboard() {
    const { user } = useAuth();
    const fullName = [user?.name, user?.last_name].filter(Boolean).join(' ').trim();

    return (
        <main
            dir="ltr"
            className={`${vazir.className} mt-20 w-full min-w-0 bg-[#f6f8f5] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <section className="mb-7 flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
                    <button
                        type="button"
                        className="rounded-2xl bg-[#c9a96e] px-6 py-3 font-bold text-[#123e35] transition hover:bg-[#fffaf0]"
                    >
                        ویرایش پروفایل حرفه‌ای
                    </button>

                    <div className="text-right">
                        <h1 className="font-black text-2xl">سلام{fullName ? ` ${fullName}` : ''}</h1>

                        <p className="mt-3 leading-7 text-[#7c8581]">
                            پرونده‌های متناسب، اقدام‌های ضروری و وضعیت
                            همکاری‌های شما.
                        </p>
                    </div>
                </section>

                <ProfessionalProfileCard />

                <div className="mt-5">
                    <DashboardStats />
                </div>

                <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <SuggestedCaseCard />
                    <ActionCenter />
                    <FeedbackCard />
                    <CooperationStatus />
                </section>
            </div>
        </main>
    );
}
