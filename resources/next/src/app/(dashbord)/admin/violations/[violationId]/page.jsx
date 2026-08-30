import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getViolationById } from '../../../../../components/pages/dashboard/admin/(violations)/(violationId)/violationDetailsData';
import ViolationDetailsPage from '../../../../../components/pages/dashboard/admin/(violations)/(violationId)/ViolationDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export async function generateMetadata({ params }) {
    const { violationId } = await params;
    const violation = getViolationById(violationId);

    return {
        title: violation
            ? `${violation.title} | وکیلم`
            : 'گزارش پیدا نشد | وکیلم',
    };
}

export default async function ViolationPage({ params }) {
    const { violationId } = await params;
    const violation = getViolationById(violationId);

    if (!violation) {
        notFound();
    }

    return (
        <main dir="rtl" className={`${vazir.className} mt-12`}>
            <ViolationDetailsPage violation={violation} />
        </main>
    );
}
