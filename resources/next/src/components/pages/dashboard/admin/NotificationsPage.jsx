import NotificationsHeader from './(notifications)/NotificationsHeader';
import NotificationsTable from './(notifications)/NotificationsTable';
import { notifications } from './(notifications)/notificationsData';

export default function NotificationsPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-10 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <NotificationsHeader />

                <NotificationsTable notifications={notifications} />
            </div>
        </main>
    );
}
