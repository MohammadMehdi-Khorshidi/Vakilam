import { Vazirmatn } from 'next/font/google';

import SecurityPage from '../../../../components/pages/dashboard/admin/SecurityPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'رویدادهای امنیتی | وکیلم',
};

export default function AdminSecurityPage() {
    return (
        <div className={`${vazir.className} mt-15`} dir="rtl">
            <SecurityPage />
        </div>
    );
}
