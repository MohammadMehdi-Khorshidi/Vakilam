import { Info } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const DocumentsNotice = () => {
    return (
        <div
            dir="rtl"
            className={`${vazirmatn.className} mb-4 flex items-start gap-3 rounded-[16px] border border-[#dce9e5] bg-[#f1f7f4] px-5 py-4`}
        >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#123f37] shadow-sm">
                <Info size={16} strokeWidth={2.2} />
            </div>

            <div className="text-right">
                <h2 className=" font-extrabold text-[#123f37]">
                    محرمانگی اسناد
                </h2>

                <p className="mt-1  leading-6 text-[#70827c]">
                    دانلود، مشاهده و اشتراک‌گذاری باید مطابق سطح دسترسی همان
                    پرونده باشد.
                </p>
            </div>
        </div>
    );
};

export default DocumentsNotice;
