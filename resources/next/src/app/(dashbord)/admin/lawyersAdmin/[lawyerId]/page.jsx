
import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getLawyerById } from '@/components/pages/dashboard/admin/(lawyers)/(lawyer-details)/lawyerDetailsData';
import LawyerDetailsPage from '@/components/pages/dashboard/admin/(lawyers)/(lawyer-details)/LawyerDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata({ params }) {
    const { lawyerId } = await params;
    const lawyer = getLawyerById(lawyerId);

    if (!lawyer) {
        return {
            title: 'وکیل پیدا نشد | وکیلم',
        };
    }

    return {
        title: `${lawyer.name} | مدیریت وکلا`,
        description: `مشاهده اطلاعات مدیریتی ${lawyer.name}`,
    };
}

export default async function LawyerDetailsRoute({ params }) {
    const { lawyerId } = await params;
    const lawyer = getLawyerById(lawyerId);

    if (!lawyer) {
        notFound();
    }

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] px-4 py-8 mt-15 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <LawyerDetailsPage lawyer={lawyer} />
        </main>
    );
}

