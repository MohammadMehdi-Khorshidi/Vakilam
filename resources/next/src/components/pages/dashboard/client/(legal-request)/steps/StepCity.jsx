import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const cities = ['تهران', 'کرج', 'اصفهان', 'شیراز', 'مشهد', 'تبریز'];

export default function StepCity({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <label className="mb-2 block font-bold">
                شهر مرتبط با موضوع پرونده
            </label>

            <select
                value={data.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-[#78a99d]"
            >
                <option value="">انتخاب شهر</option>

                {cities.map((city) => (
                    <option key={city} value={city}>
                        {city}
                    </option>
                ))}
            </select>

            <p className="mt-3 text-xs text-slate-500">
                این مورد برای پیشنهاد وکیل و تعیین حوزه رسیدگی استفاده می‌شود.
            </p>
        </div>
    );
}
