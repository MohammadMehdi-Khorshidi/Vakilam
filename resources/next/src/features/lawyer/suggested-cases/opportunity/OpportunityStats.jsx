import { BarChart3 } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const stats = [
    {
        label: 'شهر',
        value: 'تهران',
    },
    {
        label: 'فوریت',
        value: 'زیاد',
    },
    {
        label: 'مبلغ ادعایی',
        value: '۸۲,۰۰۰,۰۰۰ تومان',
    },
    {
        label: 'تناسب تخصصی',
        value: '۹۳٪',
    },
];

const OpportunityStats = () => {
    return (
        <section
            className={`${vazir.className} grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4`}
        >
            {stats.map((item) => (
                <div
                    key={item.label}
                    className="relative overflow-hidden rounded-2xl border border-[#e1e8e4] bg-white px-5 py-6 shadow-[0_4px_18px_rgba(18,63,55,0.04)]"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-right">
                            <p className="text-[#8a9590]">{item.label}</p>

                            <p className="mt-2 font-extrabold text-[#173b34]">
                                {item.value}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e0ebe5] bg-[#f8fbf9] text-[#55766b]">
                            <BarChart3 size={19} strokeWidth={1.7} />
                        </div>
                    </div>

                    <span className="absolute -bottom-7 -left-4 h-16 w-16 rounded-full bg-[#faf3e4]" />
                </div>
            ))}
        </section>
    );
};

export default OpportunityStats;
