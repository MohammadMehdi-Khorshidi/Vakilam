import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getVerificationById } from '../../../../../features/admin/verifications/details/verificationDetailsData';
import VerificationDetailsPage
    from '../../../../../features/admin/verifications/details/VerificationDetailsPage';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata({ params }) {
    const { verificationId } = await params;

    const verification = getVerificationById(verificationId);

    if (!verification) {
        return {
            title: 'درخواست احراز هویت پیدا نشد | وکیلم',
        };
    }

    return {
        title: `${verification.name} | احراز هویت وکیل`,
        description: `بررسی درخواست احراز هویت ${verification.name}`,
    };
}

export default async function VerificationDetailsRoute({ params }) {
    const { verificationId } = await params;

    const verification = getVerificationById(verificationId);

    if (!verification) {
        notFound();
    }

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f4f7f4] mt-15 px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <VerificationDetailsPage verification={verification} />
        </main>
    );
}
