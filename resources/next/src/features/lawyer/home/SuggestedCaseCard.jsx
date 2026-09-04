import { Info } from 'lucide-react';

export default function SuggestedCaseCard() {
    return (
        <article dir="rtl" className="rounded-[20px] border border-[#e0c37f] bg-white p-5 shadow-[0_8px_25px_rgba(16,47,41,0.04)] sm:p-6">
            <header className="border-b border-[#e8ece9] pb-4 text-right">
                <h2 className="text-lg font-black">پرونده پیشنهادی ویژه</h2>
                <p className="mt-2 text-xs text-[#7d8782]">تناسب تخصصی ۹۴٪</p>
            </header>

            <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#d3ad58] text-[#17342e]">
                    <strong className="text-lg font-black">۹۴٪</strong>
                    <span className="text-xs font-bold">تناسب</span>
                </div>

                <div className="flex-1 text-right">
                    <h3 className="font-black">مطالبه وجه چک</h3>

                    <p className="mt-2 text-sm leading-7 text-[#727c77]">
                        تهران · فوریت زیاد · مبلغ ۸۲۰,۰۰۰,۰۰۰ تومان
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f1f4f2] px-3 py-1 text-xs">
                            اسناد تجاری
                        </span>
                        <span className="rounded-full bg-[#f1f4f2] px-3 py-1 text-xs">
                            مطالبه وجه
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="rounded-xl bg-[#0d5145] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0d5145]/10 transition hover:bg-[#0a4037]"
                >
                    بررسی پرونده
                </button>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#cae0e8] bg-[#edf8fc] p-4 text-right">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#236276]">
                    <Info size={16} />
                </span>

                <div>
                    <strong className="text-sm">نمایش حداقلی اطلاعات:</strong>
                    <p className="mt-1 text-xs leading-6 text-[#63777b]">
                        اطلاعات تماس و هویت ضروری موکل قبل از رابطه همکاری نمایش
                        داده نمی‌شود.
                    </p>
                </div>
            </div>
        </article>
    );
}
