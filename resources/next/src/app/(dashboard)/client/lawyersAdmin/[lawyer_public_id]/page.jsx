'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import {
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    ShieldCheck,
    Star,
    MapPin,
} from 'lucide-react';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const API_URL = 'http://127.0.0.1:8000/api/lawyers/{{lawyer_public_id}}';

export default function LawyerProfilePage() {
    const params = useParams();
    const router = useRouter();

    const lawyerPublicId = params?.lawyer_public_id;

    const [lawyer, setLawyer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!lawyerPublicId) {
            return;
        }

        const getLawyerProfile = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(
                    `${API_URL}/lawyers/${lawyerPublicId}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                const result = await response.json();

                console.log('Lawyer Profile API Response:', result);

                if (!response.ok) {
                    setError(
                        result.message || 'دریافت پروفایل وکیل ناموفق بود.',
                    );

                    return;
                }

                const profile = result.data?.data ?? result.data ?? result;

                setLawyer(profile);
            } catch (err) {
                console.error('Lawyer Profile API Error:', err);

                setError('ارتباط با سرور برقرار نشد.');
            } finally {
                setLoading(false);
            }
        };

        getLawyerProfile();
    }, [lawyerPublicId]);

    // =========================
    // Loading
    // =========================

    if (loading) {
        return (
            <main
                dir="rtl"
                className={`${vazirmatn.className} flex min-h-screen items-center justify-center bg-[#f7faf8]`}
            >
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dfe7e4] border-t-[#123f37]" />

                    <p className="mt-4 text-sm font-semibold text-[#123f37]">
                        در حال دریافت پروفایل وکیل...
                    </p>
                </div>
            </main>
        );
    }

    // =========================
    // Error
    // =========================

    if (error || !lawyer) {
        return (
            <main
                dir="rtl"
                className={`${vazirmatn.className} flex min-h-screen items-center justify-center bg-[#f7faf8] px-5`}
            >
                <div className="w-full max-w-[500px] rounded-[20px] border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        !
                    </div>

                    <h2 className="mt-4 text-lg font-extrabold text-[#173f38]">
                        پروفایل وکیل پیدا نشد
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#7c8985]">
                        {error || 'اطلاعات این وکیل در دسترس نیست.'}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mt-6 rounded-[11px] bg-[#123f37] px-6 py-3 text-sm font-bold text-white"
                    >
                        بازگشت
                    </button>
                </div>
            </main>
        );
    }

    // =========================
    // اطلاعات
    // =========================

    const name = lawyer.name ?? lawyer.full_name ?? lawyer.fullName ?? 'وکیل';

    const initial = lawyer.initial ?? name.charAt(0);

    const title = lawyer.title ?? lawyer.profession ?? 'وکیل پایه یک دادگستری';

    const location = lawyer.location ?? lawyer.city ?? lawyer.province ?? '—';

    const description =
        lawyer.description ??
        lawyer.bio ??
        lawyer.about ??
        'اطلاعاتی برای معرفی این وکیل ثبت نشده است.';

    const trustScore =
        lawyer.trust_score ?? lawyer.trustScore ?? lawyer.trust ?? '—';

    const rating =
        lawyer.cooperation_score ??
        lawyer.cooperationScore ??
        lawyer.rating ??
        '—';

    const reviews =
        lawyer.reviewed_cases ??
        lawyer.reviewedCases ??
        lawyer.reviews_count ??
        lawyer.reviewsCount ??
        '—';

    const responseTime = lawyer.response_time ?? lawyer.responseTime ?? '—';

    const experience =
        lawyer.experience ??
        lawyer.experience_years ??
        lawyer.experienceYears ??
        '—';

    return (
        <main
            dir="rtl"
            className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
        >
            <div className="mx-auto max-w-[1100px] px-5 py-8 lg:px-8">
                {/* Back */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-[#315b52] transition hover:text-[#123f37]"
                >
                    <ArrowRight size={18} />
                    بازگشت به لیست وکلا
                </button>

                {/* Profile Header */}
                <section className="overflow-hidden rounded-[22px] border border-[#dfe8e4] bg-white shadow-[0_8px_30px_rgba(18,63,55,0.05)]">
                    <div className="h-[130px] bg-[#123f37]" />

                    <div className="px-6 pb-7 lg:px-8">
                        <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:text-right">
                                {/* Avatar */}
                                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[25px] border-4 border-white bg-[#174c43] text-3xl font-extrabold text-white shadow-lg">
                                    {initial}

                                    <span className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#3a9b6e] text-white">
                                        <CheckCircle2 size={16} />
                                    </span>
                                </div>

                                <div className="pt-2">
                                    <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                                        <h1 className="text-2xl font-extrabold text-[#173f38]">
                                            {name}
                                        </h1>

                                        <span className="rounded-full border border-[#cce9dc] bg-[#effaf4] px-3 py-1 text-xs font-bold text-[#27805a]">
                                            احراز هویت تأییدشده
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-[#71817c]">
                                        {title}
                                    </p>

                                    <div className="mt-2 flex items-center justify-center gap-1 text-sm text-[#71817c] lg:justify-start">
                                        <MapPin size={15} />
                                        {location}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="rounded-[12px] bg-[#123f37] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#0d302a]"
                            >
                                انتخاب این وکیل
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mt-8 border-t border-[#edf1ef] pt-6">
                            <h2 className="font-extrabold text-[#173f38]">
                                درباره وکیل
                            </h2>

                            <p className="mt-3 leading-8 text-[#62736e]">
                                {description}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Stat
                                icon={<ShieldCheck size={18} />}
                                title="امتیاز اعتماد"
                                value={trustScore}
                            />

                            <Stat
                                icon={<Star size={18} />}
                                title="امتیاز همکاری"
                                value={rating}
                            />

                            <Stat
                                icon={<CheckCircle2 size={18} />}
                                title="بازخورد بررسی‌شده"
                                value={reviews}
                            />

                            <Stat
                                icon={<BriefcaseBusiness size={18} />}
                                title="سابقه حرفه‌ای"
                                value={experience}
                            />
                        </div>

                        {/* Response */}
                        <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-[#f3f8f6] p-4 text-sm text-[#52645f]">
                            <Clock3 size={18} />

                            <span>زمان پاسخ‌گویی:</span>

                            <strong className="text-[#173f38]">
                                {responseTime}
                            </strong>
                        </div>

                        {/* Specialties */}
                        <div className="mt-7">
                            <h2 className="font-extrabold text-[#173f38]">
                                حوزه‌های تخصصی
                            </h2>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#f2f7f5] px-4 py-2 text-sm text-[#52645f]">
                                    مطالبات مالی
                                </span>

                                <span className="rounded-full bg-[#f2f7f5] px-4 py-2 text-sm text-[#52645f]">
                                    اسناد تجاری
                                </span>

                                <span className="rounded-full bg-[#f2f7f5] px-4 py-2 text-sm text-[#52645f]">
                                    قراردادها
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Stat({ icon, title, value }) {
    return (
        <div className="rounded-[14px] bg-[#f3f8f6] p-4">
            <div className="flex items-center gap-2 text-sm text-[#71817c]">
                {icon}
                <span>{title}</span>
            </div>

            <strong className="mt-3 block text-lg font-extrabold text-[#173f38]">
                {value}
            </strong>
        </div>
    );
}
