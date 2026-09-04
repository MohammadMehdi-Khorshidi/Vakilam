import { Vazirmatn } from 'next/font/google';

import ReviewsPage from '../../../../pages/dashboard/admin/ReviewsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export const metadata = {
    title: 'مدیریت بازخوردها | وکیلم',
};

export default function AdminReviewsPage() {
    return (
        <main dir="rtl" className={`${vazir.className} mt-12`}>
            <ReviewsPage />
        </main>
    );
}
