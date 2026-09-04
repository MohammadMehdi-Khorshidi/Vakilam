import { Vazirmatn } from 'next/font/google';

import ReviewDisputePage from '../../../../../features/lawyer/reviews/dispute/ReviewDisputePage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

export const metadata = {
    title: 'پاسخ یا درخواست بررسی بازخورد | وکیلم',
};

export default async function LawyerReviewDisputePage({ searchParams }) {
    const query = await searchParams;

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f5f8f6] mt-12 px-4 py-8 text-[#0b302b] sm:px-6 lg:px-10`}
        >
            <ReviewDisputePage reviewId={query?.reviewId ?? null} />
        </main>
    );
}
