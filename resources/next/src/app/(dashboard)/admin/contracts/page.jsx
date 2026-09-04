import { Vazirmatn } from 'next/font/google';
import ContractsPage from '../../../../pages/dashboard/admin/AdminContractsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'مدیریت قراردادها | وکیلم',
    description: 'کنترل وضعیت قراردادهای همکاری',
};

export default function AdminContractsRoute() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen mt-15 bg-[#f4f7f4] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <ContractsPage />
        </main>
    );
}
