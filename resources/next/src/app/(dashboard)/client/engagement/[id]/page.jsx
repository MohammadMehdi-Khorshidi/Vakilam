import EngagementWorkspacePage from '@/pages/dashboard/shared/EngagementWorkspacePage';

export default async function ClientEngagementPage({ params }) {
    const { id } = await params;
    return <EngagementWorkspacePage engagementId={id} role="client" />;
}
