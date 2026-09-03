'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import LawyerCard from '@/components/carts/LawyerCard';
import { apiRequest } from '@/lib/api/client';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export default function LawyersList() {
    const router = useRouter();

    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getLawyers = async () => {
            try {
                setLoading(true);
                setError('');

                const result = await apiRequest('/lawyers');

                const lawyerList = Array.isArray(result)
                    ? result
                    : Array.isArray(result.data)
                      ? result.data
                      : Array.isArray(result.data?.data)
                        ? result.data.data
                        : [];

                setLawyers(lawyerList);
            } catch (err) {
                console.error('Lawyers API Error:', err);

                setError('ارتباط با سرور برقرار نشد.');
            } finally {
                setLoading(false);
            }
        };

        getLawyers();
    }, []);

    // =========================
    // Loading
    // =========================

    if (loading) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} flex min-h-[300px] items-center justify-center`}
            >
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dfe7e4] border-t-[#123f37]" />

                    <p className="mt-4 text-sm font-semibold text-[#123f37]">
                        در حال دریافت لیست وکلا...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // Error
    // =========================

    if (error) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} rounded-[18px] border border-red-100 bg-white p-8 text-center`}
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                    !
                </div>

                <h3 className="mt-4 font-extrabold text-[#173f38]">
                    دریافت اطلاعات وکلا ناموفق بود
                </h3>

                <p className="mt-2 text-sm text-[#7b8783]">{error}</p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-[10px] bg-[#123f37] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0d302a]"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    // =========================
    // Empty
    // =========================

    if (lawyers.length === 0) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} rounded-[18px] border border-[#e2e9e6] bg-white p-10 text-center`}
            >
                <h3 className="font-extrabold text-[#173f38]">
                    وکیلی پیدا نشد
                </h3>

                <p className="mt-2 text-sm text-[#7b8783]">
                    در حال حاضر وکیلی برای نمایش وجود ندارد.
                </p>
            </div>
        );
    }

    // =========================
    // Lawyers
    // =========================

    return (
        <section dir="rtl" className={`${vazir.className} space-y-4`}>
            {lawyers.map((lawyer, index) => {
                const publicId =
                    lawyer.lawyer_public_id ?? lawyer.public_id ?? lawyer.id;

                const name =
                    lawyer.name ??
                    lawyer.full_name ??
                    lawyer.fullName ??
                    'وکیل';

                const initial = lawyer.initial ?? name?.charAt(0) ?? 'و';

                const title =
                    lawyer.title ??
                    lawyer.profession ??
                    'وکیل پایه یک دادگستری';

                const location =
                    lawyer.location ?? lawyer.city ?? lawyer.province ?? '—';

                const description =
                    lawyer.description ??
                    lawyer.bio ??
                    lawyer.about ??
                    'اطلاعات معرفی این وکیل در دسترس نیست.';

                const trustScore =
                    lawyer.trust_score ??
                    lawyer.trustScore ??
                    lawyer.trust ??
                    '—';

                const cooperationScore =
                    lawyer.cooperation_score ??
                    lawyer.cooperationScore ??
                    lawyer.rating ??
                    '—';

                const reviewedCases =
                    lawyer.reviewed_cases ??
                    lawyer.reviewedCases ??
                    lawyer.reviews_count ??
                    lawyer.reviewsCount ??
                    '—';

                const responseTime =
                    lawyer.response_time ?? lawyer.responseTime ?? '—';

                const experience =
                    lawyer.experience ??
                    lawyer.experience_years ??
                    lawyer.experienceYears ??
                    '—';

                const match =
                    lawyer.match ??
                    lawyer.match_score ??
                    lawyer.matchScore ??
                    '—';

                return (
                    <LawyerCard
                        key={publicId ?? index}
                        {...lawyer}
                        id={lawyer.id}
                        lawyer_public_id={publicId}
                        name={name}
                        initial={initial}
                        title={title}
                        location={location}
                        description={description}
                        trustScore={trustScore}
                        cooperationScore={cooperationScore}
                        reviewedCases={reviewedCases}
                        responseTime={responseTime}
                        experience={experience}
                        match={match}
                        onProfileClick={() => {
                            if (!publicId) {
                                console.error(
                                    'Lawyer public ID not found:',
                                    lawyer,
                                );
                                return;
                            }

                            router.push(`/client/lawyers/${publicId}`);
                        }}
                    />
                );
            })}
        </section>
    );
}
