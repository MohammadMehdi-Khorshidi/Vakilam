import AdminSidebar from '../../../components/dashboard/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';


export default function AdminLayout({ children }) {
    return (
        <div dir="rtl" className="min-h-screen bg-[#f6f8f7]">
            <AdminSidebar/>

            <div className="min-h-screen lg:mr-[280px]">
                <DashboardHeader userName="ایدا" role="ادمین" />

                <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
