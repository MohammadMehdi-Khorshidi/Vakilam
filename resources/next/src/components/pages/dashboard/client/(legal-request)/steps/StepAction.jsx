import { Vazirmatn } from 'next/font/google';

import ChoiceButton from '../../../../../ui/legalRequest/ChoiceButton';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const actions = [
    'ارسال اظهارنامه یا اخطار رسمی',
    'شروع مذاکره و سازش',
    'ثبت دادخواست یا شکایت',
    'فعلاً فقط دریافت مشاوره',
];

export default function StepAction({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <div className="mb-5 rounded-xl bg-[#e8f2ef] p-4 font-bold">
                براساس پاسخ‌ها، کدام اقدام به نیاز فعلی شما نزدیک‌تر است؟
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {actions.map((action) => (
                    <ChoiceButton
                        key={action}
                        active={data.action === action}
                        onClick={() => update('action', action)}
                    >
                        {action}
                    </ChoiceButton>
                ))}
            </div>
        </div>
    );
}
