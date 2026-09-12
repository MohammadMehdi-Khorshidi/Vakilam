import EngagementWorkspacePage from '@/pages/dashboard/shared/EngagementWorkspacePage';

export default async function LawyerEngagementPage({ params }) {
    const { id } = await params;
    return <EngagementWorkspacePage engagementId={id} role="lawyer" />;
}
