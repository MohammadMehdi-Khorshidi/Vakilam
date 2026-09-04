'use client';

import { useEffect, useState } from 'react';
import { Info, Loader2, Sparkles } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';
import { apiRequest } from '@/lib/api/client';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400', '500', '600', '700', '800'] });

export default function StepCategory({ data, update }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        apiRequest('/reference/legal-categories')
            .then((result) => {
                if (active) setCategories(Array.isArray(result?.data) ? result.data : []);
            })
            .catch((err) => {
                if (active) setError(err.message || 'دریافت دسته‌بندی‌ها ناموفق بود.');
            })
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    const selected = categories.find((item) => item.id === data.legal_category_id);

    return (
        <div dir="rtl" className={vazir.className}>
            <div className="mb-5 rounded-[15px] border border-[#d8bb82]/60 bg-[#fffaf0] px-5 py-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7edcf]"><Sparkles size={17} className="text-[#c69f48]" /></div>
                    <div>
                        <span className="text-[11px] font-semibold text-[#8c8170]">دسته‌بندی پرونده</span>
                        <h3 className="mt-1 text-[17px] font-black text-[#243f38]">{selected?.name || 'یک دسته را انتخاب کنید'}</h3>
                    </div>
                </div>
            </div>

            {loading ? <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={18}/>در حال دریافت دسته‌بندی‌ها...</div> : null}
            {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
                    const isSelected = data.legal_category_id === category.id;
                    return (
                        <button key={category.id} type="button" onClick={() => { update('legal_category_id', category.id); update('category', category.name); }}
                            className={`min-h-[110px] rounded-[15px] border p-5 text-center transition ${isSelected ? 'border-[#d3a94f] bg-[#fffdf7]' : 'border-[#dfe7e4] bg-white hover:border-[#b8cec6]'}`}>
                            <h3 className="text-[13px] font-extrabold text-[#173f38]">{category.name}</h3>
                            {category.code ? <p className="mt-2 text-[10px] text-[#899591]">{category.code}</p> : null}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#d4e8ef] bg-[#eff8fc] px-4 py-3">
                <Info size={16} className="mt-1 text-[#477987]" />
                <p className="text-[10px] leading-6 text-[#70878d]">این دسته‌بندی مستقیماً از داده مرجع Backend وکیلم دریافت می‌شود.</p>
            </div>
        </div>
    );
}
