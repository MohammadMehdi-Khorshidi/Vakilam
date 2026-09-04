import MessagesLawyerPage from '../../../../pages/dashboard/lawyer/MessagesLawyerPage';

export const metadata = {
    title: 'پیام‌ها و تماس‌ها | وکیلم',
};

export default function Page() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f5f8f6] px-4 py-8 text-[#0b302b] sm:px-6 lg:px-10"
        >
            <MessagesLawyerPage/>
        </main>
    );
}
