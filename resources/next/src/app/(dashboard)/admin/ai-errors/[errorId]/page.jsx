import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getAiErrorById } from '../../../../../features/admin/ai-errors/details/aiErrorDetailsData';
import AiErrorDetailsPage from '../../../../../features/admin/ai-errors/details/AiErrorDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata({ params }) {
    const { errorId } = await params;
    const error = getAiErrorById(errorId);

    return {
        title: error
            ? `${error.field} | تاریخچه اصلاح هوش مصنوعی`
            : 'اصلاح پیدا نشد | وکیلم',
    };
}

export default async function AiErrorDetailsRoute({ params }) {
    const { errorId } = await params;
    const error = getAiErrorById(errorId);

    if (!error) {
        notFound();
    }

    return (
        <div className={`${vazir.className} mt-15`} dir="rtl">
            <AiErrorDetailsPage error={error} />
        </div>
    );
}
