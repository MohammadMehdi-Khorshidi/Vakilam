import { Vazirmatn } from 'next/font/google';
import { categoryLabel, urgencyLabel } from '@/lib/intake';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepSummary({ data }) {
    const rows = [
        ['شرح مسئله', data.description || 'ثبت نشده'],
        [
            'دسته‌بندی',
            data.legal_category_id && !data.category
                ? 'دسته‌بندی ذخیره‌شده'
                : categoryLabel(data.category),
        ],
        ['پاسخ راهنما', data.answer || 'ثبت نشده'],
        ['اقدام ترجیحی', data.action || 'ثبت نشده'],
        ['شهر', data.city || 'ثبت نشده'],
        ['فوریت', urgencyLabel(data.urgency)],
        ['تعداد مدارک', String(data.documents?.length ?? 0)],
        ['محرمانگی', data.privacy || 'ثبت نشده'],
    ];

    return (
        <div
            dir="rtl"
            className={`${vazir.className} mb-5 overflow-hidden rounded-xl border`}
        >
            {rows.map(([label, value]) => (
                <div
                    key={label}
                    className="grid grid-cols-[140px_1fr] border-b last:border-0"
                >
                    <b className="bg-[#e8f2ef] p-4 text-sm">{label}</b>

                    <span className="p-4 text-sm leading-6 text-slate-600">
                        {value}
                    </span>
                </div>
            ))}
        </div>
    );
}
