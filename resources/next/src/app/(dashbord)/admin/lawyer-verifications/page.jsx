import { Vazirmatn } from 'next/font/google';
import VerificationsPage from '../../../../components/pages/dashboard/admin/VerificationsPage';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'احراز هویت وکلا | وکیلم',
    description: 'مدیریت و بررسی درخواست‌های احراز هویت وکلا',
};

export default function AdminVerificationsPage() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] mt-10 px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <VerificationsPage />
        </main>
    );
}
