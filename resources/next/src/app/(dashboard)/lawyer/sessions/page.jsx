import SessionsLawyerPage from '../../../../pages/dashboard/lawyer/SessionsLawyerPage';

export const metadata = {
    title: 'جلسات | وکیلم',
};

export default function LawyerMeetingsPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f5f8f6] px-4 py-8 text-[#0b302b] sm:px-6 lg:px-10"
        >
            <SessionsLawyerPage />
        </main>
    );
}
