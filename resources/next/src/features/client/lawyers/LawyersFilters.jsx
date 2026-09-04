'use client';

import { useState } from 'react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const filters = [
    {
        id: 'best',
        label: 'بیشترین تناسب',
    },
    {
        id: 'fast',
        label: 'پاسخ‌گویی سریع',
    },
    {
        id: 'experience',
        label: 'سابقه بیشتر',
    },
];

const LawyersFilters = () => {
    const [activeFilter, setActiveFilter] = useState('best');

    return (
        <div
            dir="ltr"
            className={`${vazirmatn.className} mb-4 flex items-center justify-end gap-2`}
        >
            {filters.map((filter) => {
                const active = activeFilter === filter.id;

                return (
                    <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter.id)}
                        className={`rounded-full border px-5 py-2.5 font-bold transition-all duration-200 ${
                            active
                                ? 'border-[#d8bb82] bg-[#fffdf8] text-[#294e46] shadow-[0_3px_10px_rgba(18,63,55,0.04)]'
                                : 'border-[#e1e8e5] bg-white text-[#64736f] hover:border-[#cbd8d3] hover:text-[#123f37]'
                        }`}
                    >
                        {filter.label}
                    </button>
                );
            })}
        </div>
    );
};

export default LawyersFilters;
