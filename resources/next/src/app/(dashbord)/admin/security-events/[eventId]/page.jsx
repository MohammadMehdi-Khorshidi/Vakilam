import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getSecurityEventById } from '../../../../../components/pages/dashboard/admin/(security)/(eventId)/securityDetailsData';
import SecurityDetailsPage from '@/components/pages/dashboard/admin/(security)/(eventId)/SecurityDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata({ params }) {
    const { eventId } = await params;
    const event = getSecurityEventById(eventId);

    return {
        title: event ? `${event.title} | وکیلم` : 'رویداد پیدا نشد | وکیلم',
    };
}

export default async function SecurityEventPage({ params }) {
    const { eventId } = await params;
    const event = getSecurityEventById(eventId);

    if (!event) {
        notFound();
    }

    return (
        <div className={`${vazir.className} mt-15`} dir="rtl">
            <SecurityDetailsPage event={event} />
        </div>
    );
}
