import { Vazirmatn } from 'next/font/google';
import AiErrorsPage from '../../../../pages/dashboard/admin/AiErrorsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function Page() {
    return (
        <main dir="rtl" className={vazir.className}>
            <AiErrorsPage/>
        </main>
    );
}
