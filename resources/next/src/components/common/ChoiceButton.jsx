import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function ChoiceButton({
    active,
    children,
    onClick,
    disabled = false,
}) {
    return (
        <button
            dir="rtl"
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${vazir.className} flex items-center gap-3 rounded-xl border p-4 text-right transition ${
                disabled
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-55'
                    : active
                      ? 'border-[#78a99d] bg-[#e8f2ef] ring-1 ring-[#78a99d]'
                      : 'border-slate-200 bg-white hover:border-[#78a99d]'
            }`}
        >
            <span
                className={`h-5 w-5 shrink-0 rounded-full ${
                    active && !disabled ? 'bg-[#287660]' : 'bg-[#dce7e3]'
                }`}
            />

            {children}
        </button>
    );
}
