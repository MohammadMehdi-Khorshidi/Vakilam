import { Vazirmatn } from 'next/font/google';
import TasksLawyerPage from '../../../../components/pages/dashboard/lawyer/TasksLawyerPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],

    weight: ['400', '500', '600', '700'],

    display: 'swap',
});

export const metadata = {
    title: 'کارهای من | وکیلم',
};

export default function LawyerTasksPage() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f5f8f6] mt-15 px-4 py-8 text-[#0b302b] sm:px-6 lg:px-10`}
        >
            <TasksLawyerPage />
        </main>
    );
}
