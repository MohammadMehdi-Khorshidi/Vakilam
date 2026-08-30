import { Vazirmatn } from 'next/font/google';
import CasesAdminPage from '../../../../components/pages/dashboard/admin/CasesAdminPage';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'مدیریت پرونده‌ها | وکیلم',
    description: 'مدیریت و بررسی وضعیت عملیاتی پرونده‌های وکیلم',
};

export default function AdminCasesRoute() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] mt-15 px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <CasesAdminPage />
        </main>
    );
}
