import ClientNegotiationChatPage from '../../../../../pages/dashboard/client/ClientNegotiationChatPage';

export const metadata = {
    title: 'مذاکره با وکیل | وکیلم',
};

export default async function Page({ params }) {
    const { id } = await params;
    return <ClientNegotiationChatPage negotiationId={id} />;
}
