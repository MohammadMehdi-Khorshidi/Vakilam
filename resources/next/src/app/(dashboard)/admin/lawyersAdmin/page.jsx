
import LawyersPage from '../../../../pages/dashboard/admin/LawyersPage';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'مدیریت وکلا | وکیلم',
    description: 'مدیریت اعتبار حرفه‌ای و دسترسی وکلا',
};

export default function AdminLawyersPage() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] px-4 py-8 mt-10 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <LawyersPage />
        </main>
    );
}
