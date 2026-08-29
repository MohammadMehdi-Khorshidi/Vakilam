
import HomeAdminPage from '../../../components/pages/dashboard/admin/HomeAdminPage';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function Page() {
    return (
        <main dir="rtl" className={vazir.className}>
            <HomeAdminPage />
        </main>
    );
}
