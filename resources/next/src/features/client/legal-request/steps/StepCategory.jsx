'use client';

import { Info } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { categories, normalizeCategoryCode } from '@/lib/intake';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepCategory({ data, update, validationError }) {
    const selectedCategory = normalizeCategoryCode(data.category);

    const selectCategory = (category) => {
        update('legal_category_id', null);
        update('category', category.id);
    };

    return (
        <div dir="rtl" className={vazir.className}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
                    const selected = selectedCategory === category.id;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => selectCategory(category)}
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
                                {category.title}
                            </h3>

                            <p className="mt-2 text-center text-[10px] leading-6 text-[#899591]">
                                {category.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            {validationError ? (
                <p className="mt-3 text-sm font-bold text-red-600">
                    {validationError}
                </p>
            ) : null}

            <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#d4e8ef] bg-[#eff8fc] px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#477987]">
                    <Info size={16} />
                </div>

                <div>
                    <h3 className="text-[11px] font-extrabold text-[#294d54]">
                        دسته‌بندی قابل اصلاح است
                    </h3>

                    <p className="mt-1 text-[10px] leading-6 text-[#70878d]">
                        انتخاب این مرحله فقط برای پیشنهاد مسیر و وکیل مرتبط استفاده می‌شود.
                    </p>
                </div>
            </div>
        </div>
    );
}
