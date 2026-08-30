import { Vazirmatn } from 'next/font/google';
import BypassPage from '../../../../components/pages/dashboard/admin/BypassPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'تلاش برای دور زدن | وکیلم',
};
export default function Page() {
    return (
        <main dir="rtl" className={`${vazir.className} mt-12`}>

            {' '}
            <BypassPage/>
        </main>
    );
}
