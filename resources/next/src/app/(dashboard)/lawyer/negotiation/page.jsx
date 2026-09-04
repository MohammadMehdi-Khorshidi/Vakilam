import { Vazirmatn } from 'next/font/google';
import NegotiationPage from '../../../../features/lawyer/security/negotiation/NegotiationPage';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

export const metadata = {
    title: 'مذاکره شرایط همکاری | وکیلم',
};

export default function LawyerNegotiationPage() {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f5f8f6] px-4 py-8 text-[#0b302b] sm:px-6 lg:px-10`}
        >
            <NegotiationPage />
        </main>
    );
}
