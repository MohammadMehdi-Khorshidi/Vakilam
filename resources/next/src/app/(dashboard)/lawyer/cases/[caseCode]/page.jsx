import LawyerCaseDetailPage from '@/pages/dashboard/lawyer/LawyerCaseDetailPage';

export const metadata = {
    title: 'جزئیات پرونده | وکیلم',
};

export default async function Page({ params }) {
    const { caseCode } = await params;
    return <LawyerCaseDetailPage engagementId={decodeURIComponent(caseCode)} />;
}
