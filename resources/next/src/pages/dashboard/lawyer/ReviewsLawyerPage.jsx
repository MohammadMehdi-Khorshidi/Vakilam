'use client';

import { useMemo } from 'react';


import { reviews } from '../../../features/lawyer/reviews/reviewsData';
import ReviewsSummary from '@/features/lawyer/reviews/ReviewsSummary';
import ReviewsList from '@/features/lawyer/reviews/ReviewsList';

export default function ReviewsLawyerPage() {
    const sortedReviews = useMemo(() => {
        return [...reviews].sort(
            (firstReview, secondReview) =>
                new Date(secondReview.createdAt).getTime() -
                new Date(firstReview.createdAt).getTime(),
        );
    }, []);

    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <header className="mb-8 pt-4">
                <div className="flex items-center gap-3">
                    <span className="h-px w-7 bg-[#c99f42]" />

                    <p className="text-sm font-bold text-[#a47b2c]">
                        بازخوردهای همکاری
                    </p>
                </div>

                <h1 className="mt-5 text-3xl font-black leading-tight text-[#0b302b] sm:text-4xl">
                    امتیاز تجربه همکاری شما
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#75847f]">
                    بازخوردها نتیجه پرونده را نشان نمی‌دهند و فقط از همکاری‌های
                    ثبت‌شده دریافت می‌شوند.
                </p>
            </header>

            <ReviewsSummary reviews={sortedReviews} />

            <ReviewsList reviews={sortedReviews} />
        </div>
    );
}
