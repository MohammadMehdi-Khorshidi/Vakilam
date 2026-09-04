import { Vazirmatn } from 'next/font/google';
import SensitiveAccessPage
    from '../../../../../../features/admin/lawyers/details/sensitive-access/SensitiveAccessPage';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'ثبت دلیل مشاهده | وکیلم',
    description: 'ثبت دلیل دسترسی به اطلاعات حساس',
};

export default async function SensitiveAccessRoute({ searchParams }) {
    const params = await searchParams;

    const requestId = params?.request || '';

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <SensitiveAccessPage requestId={requestId} />
        </main>
    );
}
