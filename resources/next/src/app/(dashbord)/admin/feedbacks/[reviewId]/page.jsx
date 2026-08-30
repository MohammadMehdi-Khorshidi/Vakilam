import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getReviewById } from '../../../../../components/pages/dashboard/admin/(reviews)/(reviewId)/reviewDetailsData';
import ReviewDetailsPage from '@/components/pages/dashboard/admin/(reviews)/(reviewId)/ReviewDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export default async function FeedbackDetailsPage({ params }) {
    const { reviewId } = await params;
    const review = getReviewById(reviewId);

    if (!review) {
        notFound();
    }

    return (
        <main dir="rtl" className={`${vazir.className} mt-12`}>
            <ReviewDetailsPage review={review} />
        </main>
    );
}
