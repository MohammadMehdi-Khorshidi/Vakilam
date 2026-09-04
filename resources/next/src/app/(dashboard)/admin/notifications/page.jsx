import { Vazirmatn } from 'next/font/google';

import NotificationsPage from '../../../../pages/dashboard/admin/NotificationsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'اعلان‌های مهم سامانه | وکیلم',
};

export default function AdminNotificationsPage() {
    return (
        <div className={`${vazir.className} mt-15`} dir="rtl">
            <NotificationsPage />
        </div>
    );
}
