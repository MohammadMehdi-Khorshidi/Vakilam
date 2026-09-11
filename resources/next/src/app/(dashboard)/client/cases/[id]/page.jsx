import CaseDetailPage from '../../../../../pages/dashboard/client/CaseDetailPage';

export default async function Page({ params }) {
    const { id } = await params;

    return <CaseDetailPage caseId={id} />;
}
