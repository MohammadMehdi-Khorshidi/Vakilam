'use client';

import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';
import LawyerCard from '@/components/carts/LawyerCard';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const lawyers = [
    {
        id: 1,
        lawyer_public_id: 'lawyer-1',
        name: 'علی رضایی',
        initial: 'ع',
        title: 'وکیل پایه یک دادگستری',
        location: 'تهران',
        description:
            'متخصص در پرونده‌های حقوقی، قراردادها و دعاوی ملکی با سابقه حرفه‌ای در مشاوره و پیگیری پرونده‌ها.',
        trustScore: 95,
        cooperationScore: 92,
        reviewedCases: 120,
        responseTime: 'کمتر از ۱ ساعت',
        experience: '۱۰ سال',
        match: 98,
    },
    {
        id: 2,
        lawyer_public_id: 'lawyer-2',
        name: 'مریم احمدی',
        initial: 'م',
        title: 'وکیل پایه یک دادگستری',
        location: 'کرج',
        description:
            'فعال در حوزه خانواده، طلاق، مهریه و دعاوی حقوقی با تمرکز بر ارائه راهکارهای دقیق و کاربردی.',
        trustScore: 91,
        cooperationScore: 89,
        reviewedCases: 84,
        responseTime: 'حدود ۲ ساعت',
        experience: '۷ سال',
        match: 94,
    },
    {
        id: 3,
        lawyer_public_id: 'lawyer-3',
        name: 'محمد کریمی',
        initial: 'م',
        title: 'وکیل پایه یک دادگستری',
        location: 'اصفهان',
        description:
            'متخصص پرونده‌های کیفری و تجاری با تجربه در رسیدگی به پرونده‌های پیچیده و مذاکرات حقوقی.',
        trustScore: 89,
        cooperationScore: 93,
        reviewedCases: 102,
        responseTime: 'کمتر از ۳ ساعت',
        experience: '۸ سال',
        match: 91,
    },
];

export default function LawyersList() {
    const router = useRouter();

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
                    lawyer.location ??
                    lawyer.city ??
                    lawyer.province ??
                    '—';

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
                    lawyer.response_time ??
                    lawyer.responseTime ??
                    '—';

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
                            router.push(`/client/lawyers/${publicId}`);
                        }}
                    />
                );
            })}
        </section>
    );
}
