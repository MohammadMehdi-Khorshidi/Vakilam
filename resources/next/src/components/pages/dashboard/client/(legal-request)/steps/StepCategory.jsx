'use client';

import { Info, Sparkles } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { categories } from '@/lib/intake';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepCategory({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            {/* AI Suggestion */}
            <div className="mb-5 rounded-[15px] border border-[#d8bb82]/60 bg-[#fffaf0] px-5 py-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7edcf]">
                        <Sparkles size={17} className="text-[#c69f48]" />
                    </div>

                    <div>
                        <span className="text-[11px] font-semibold text-[#8c8170]">
                            پیشنهاد دستیار هوشمند
                        </span>

                        <h3 className="mt-1 text-[17px] font-black text-[#243f38]">
                            {data.category}
                        </h3>

                        <p className="mt-1.5 text-[11px] leading-6 text-[#7f8985]">
                            براساس شرح مسئله، نزدیک‌ترین دسته انتخاب شده است؛
                            شما می‌توانید آن را اصلاح کنید.
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
                    const selected = data.category === category.id;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => update('category', category.id)}
                            className={`min-h-[130px] rounded-[15px] border p-5 text-right transition-all duration-200 ${
                                selected
                                    ? 'border-[#d3a94f] bg-[#fffdf7] shadow-[0_5px_18px_rgba(201,169,110,0.08)]'
                                    : 'border-[#dfe7e4] bg-white hover:border-[#b8cec6] hover:bg-[#fbfcfc]'
                            }`}
                        >
                            <div
                                className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] font-extrabold ${
                                    selected
                                        ? 'bg-[#eff6f3] text-[#123f37]'
                                        : 'bg-[#f1f6f4] text-[#123f37]'
                                }`}
                            >
                                {category.letter}
                            </div>

                            <h3 className="text-center text-[12px] font-extrabold text-[#173f38]">
                                {category.id}
                            </h3>

                            <p className="mt-2 text-center text-[10px] leading-6 text-[#899591]">
                                {category.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Notice */}
            <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#d4e8ef] bg-[#eff8fc] px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#477987]">
                    <Info size={16} />
                </div>

                <div>
                    <h3 className="text-[11px] font-extrabold text-[#294d54]">
                        دستیار به تصمیم‌گیری کمک می‌کند
                    </h3>

                    <p className="mt-1 text-[10px] leading-6 text-[#70878d]">
                        دسته‌بندی فقط برای پیشنهاد دادن مسیر مناسب و یافتن وکیل
                        مرتبط استفاده می‌شود و قابل اصلاح باقی می‌ماند.
                    </p>
                </div>
            </div>
        </div>
    );
}
