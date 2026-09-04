import { Vazirmatn } from 'next/font/google';
import ViolationsPage from '../../../../pages/dashboard/admin/ViolationsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function Page() {
    return (
        <main dir="rtl" className={`${vazir.className} mt-12`}>
            {' '}
            <ViolationsPage />
        </main>
    );
}
