import LawyerSidebar from '@/components/dashboard/LawyerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function LawyerLayout({ children }) {
    return (
        <div dir="rtl" className="min-h-screen bg-[#f6f8f7]">
            <LawyerSidebar />

            <div className="min-h-screen lg:mr-[280px]">
                <DashboardHeader userName="ایدا" role="وکیل" />

                <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
