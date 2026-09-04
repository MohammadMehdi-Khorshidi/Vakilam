
import UsersPage from '../../../../pages/dashboard/admin/AdminUsersPage';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'کاربران و وضعیت دسترسی | وکیلم',
    description: 'مدیریت کاربران سامانه وکیلم',
};

export default function AdminUsersPage() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <UsersPage />
        </main>
    );
}
