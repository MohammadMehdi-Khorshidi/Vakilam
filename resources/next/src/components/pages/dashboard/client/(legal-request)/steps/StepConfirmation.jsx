import { Vazirmatn } from 'next/font/google';

import StepSummary from './StepSummary';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepConfirmation({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <StepSummary data={data} />

            <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                    data.confirmed
                        ? 'border-[#78a99d] bg-[#e8f2ef]'
                        : 'border-slate-200'
                }`}
            >
                <input
                    type="checkbox"
                    checked={data.confirmed}
                    onChange={(e) => update('confirmed', e.target.checked)}
                    className="mt-1 h-5 w-5 accent-[#0d4d42]"
                />

                <span>
                    <b>اطلاعات بالا را بررسی و تأیید کردم.</b>

                    <small className="mt-1 block text-slate-500">
                        ثبت نهایی به معنی قبول قرارداد با وکیل نیست.
                    </small>
                </span>
            </label>
        </div>
    );
}
