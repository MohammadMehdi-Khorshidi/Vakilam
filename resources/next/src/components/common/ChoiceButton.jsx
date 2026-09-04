
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function ChoiceButton({ active, children, onClick }) {
    return (
        <button
            dir="rtl"

            type="button"
            onClick={onClick}
            className={`${vazir.className} flex items-center gap-3 rounded-xl border p-4 text-right transition ${
                active
                    ? 'border-[#78a99d] bg-[#e8f2ef] ring-1 ring-[#78a99d]'
                    : 'border-slate-200 bg-white hover:border-[#78a99d]'
            }`}
        >
            <span
                className={`h-5 w-5 shrink-0 rounded-full ${
                    active ? 'bg-[#287660]' : 'bg-[#dce7e3]'
                }`}
            />

            {children}
        </button>
    );
}
