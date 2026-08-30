import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getNotificationById } from '../../../../../components/pages/dashboard/admin/(notifications)/(notificationId)/notificationDetailsData';
import NotificationDetailsPage from '@/components/pages/dashboard/admin/(notifications)/(notificationId)/NotificationDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata({ params }) {
    const { notificationId } = await params;
    const notification = getNotificationById(notificationId);

    return {
        title: notification
            ? `${notification.title} | وکیلم`
            : 'اعلان پیدا نشد | وکیلم',
    };
}

export default async function NotificationDetailsRoute({ params }) {
    const { notificationId } = await params;
    const notification = getNotificationById(notificationId);

    if (!notification) {
        notFound();
    }

    return (
        <div className={`${vazir.className} mt-15`} dir="rtl">
            <NotificationDetailsPage notification={notification} />
        </div>
    );
}
