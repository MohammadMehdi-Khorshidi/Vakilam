import { Vazirmatn } from 'next/font/google';
import EarningsPage from '../../../../components/pages/dashboard/lawyer/EarningsPage';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

export const metadata = {
    title: 'پرداخت‌ها و درآمد | وکیلم',
};

export default function LawyerEarningsPage() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen mt-12 bg-[#f5f8f6] px-4 py-8 text-[#0b302b] sm:px-6 lg:px-10`}
        >
            <EarningsPage />
        </main>
    );
}
