import { Info } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const LawyersNotice = () => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} mb-4 rounded-[15px] border border-[#d0e7ef] bg-[#eff9fc] px-5 py-3.5`}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#477987]">
                    <Info size={15} strokeWidth={2.2} />
                </div>

                <div className="text-right">
                    <h2 className="font-extrabold text-[#294d54]">
                        درباره امتیازها
                    </h2>

                    <p className="mt-1 leading-6 text-[#70878d]">
                        «امتیاز تجربه همکاری» فقط کیفیت تجربه موکلان در همکاری
                        ثبت‌شده را نشان می‌دهد. «امتیاز اعتماد» نیز بر وضعیت
                        احراز و شاخص‌های حرفه‌ای سامانه ساخته می‌شود.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default LawyersNotice;
