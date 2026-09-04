import { Vazirmatn } from 'next/font/google';

import CaseDetails from '../../../../../features/lawyer/cases/[caseCode]/CaseDetails';
import { getCaseDetails } from '../../../../../features/lawyer/cases/[caseCode]/caseData';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export const metadata = {
    title: 'جزئیات پرونده | وکیلم',
};

export default async function LawyerCaseDetailsPage({ params, searchParams }) {
    const { caseCode } = await params;
    const query = await searchParams;

    const decodedCaseCode = decodeURIComponent(caseCode);

    const caseItem = await getCaseDetails(decodedCaseCode);

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f5f8f6] px-4 mt-15 py-8 text-[#0b302b] sm:px-6 lg:px-10`}
        >
            <CaseDetails
                caseItem={caseItem}
                initialTab={query?.tab ?? 'overview'}
            />
        </main>
    );
}
