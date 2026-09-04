import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getBypassEventById } from '../../../../../features/admin/bypass-attempts/details/bypassDetailsData';
import BypassDetailsPage from '../../../../../features/admin/bypass-attempts/details/BypassDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export async function generateMetadata({ params }) {
    const { eventId } = await params;
    const event = getBypassEventById(eventId);

    return {
        title: event
            ? `${event.detectionType} | وکیلم`
            : 'رویداد پیدا نشد | وکیلم',
    };
}

export default async function BypassEventPage({ params }) {
    const { eventId } = await params;

    const event = getBypassEventById(eventId);

    if (!event) {
        notFound();
    }

    return (
        <main dir="rtl" className={`${vazir.className} mt-15`}>
            <BypassDetailsPage event={event} />
        </main>
    );
}
