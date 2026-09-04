import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getCaseById } from '../../../../../features/admin/cases/details/caseDetailsData';
import CaseDetailsPage
    from '../../../../../features/admin/cases/details/CaseDetailsPage';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata({ params }) {
    const { caseId } = await params;

    const caseData = getCaseById(caseId);

    if (!caseData) {
        return {
            title: 'پرونده پیدا نشد | وکیلم',
        };
    }

    return {
        title: `${caseData.title} | مدیریت پرونده | وکیلم`,
        description: `مشاهده جزئیات مدیریتی پرونده ${caseData.id}`,
    };
}

export default async function AdminCaseDetailsRoute({ params }) {
    const { caseId } = await params;

    const caseData = getCaseById(caseId);

    if (!caseData) {
        notFound();
    }

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] mt-15 px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <CaseDetailsPage caseData={caseData} />
        </main>
    );
}
