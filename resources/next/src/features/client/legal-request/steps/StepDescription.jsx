import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const suggestions = ['چک پرداخت‌نشده', 'اختلاف قراردادی', 'اختلاف ملکی'];

export default function StepDescription({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <label className="mb-2 block text-sm font-bold">
                شرح مسئله شما
            </label>

            <textarea
                value={data.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="مثلاً: برای خرید کالا چک داده‌ام اما سررسید پاس نشده و نمی‌دانم..."
                className="min-h-56 w-full resize-y rounded-xl border border-slate-200 bg-white p-4 outline-none transition focus:border-[#78a99d] focus:ring-2 focus:ring-[#78a99d]/20"
            />

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {suggestions.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => update('description', item)}
                        className="rounded-full border px-4 py-2 hover:bg-slate-50"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}
