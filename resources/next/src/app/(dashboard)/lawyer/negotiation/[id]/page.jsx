import LawyerNegotiationChatPage from '../../../../../pages/dashboard/lawyer/LawyerNegotiationChatPage';

export const metadata = {
    title: 'گفت‌وگوی مذاکره | وکیلم',
};

export default async function Page({ params }) {
    const { id } = await params;
    return <LawyerNegotiationChatPage negotiationId={id} />;
}
