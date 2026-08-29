
import SensitiveAccessPage
    from '../../../../../components/pages/dashboard/admin/(home)/(sensitive-access)/SensitiveAccessPage';

import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'ثبت دلیل مشاهده | وکیلم',
    description: 'ثبت دلیل دسترسی به اطلاعات حساس',
};

export default function SensitiveAccessRoute() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <SensitiveAccessPage />
        </main>
    );
}
