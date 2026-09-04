import { Info } from 'lucide-react';

const CategoryNotice = () => {
    return (
        <div
            dir="rtl"
            className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#d4e8ef] bg-[#eff8fc] px-4 py-3"
        >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#477987]">
                <Info size={16} />
            </div>

            <div>
                <h3 className="font-extrabold text-[#294d54]">
                    دستیار به تصمیم‌گیری کمک می‌کند
                </h3>

                <p className="mt-1 leading-6 text-[#70878d]">
                    دسته‌بندی فقط برای پیشنهاد دادن مسیر مناسب و یافتن وکیل
                    مرتبط استفاده می‌شود و قابل اصلاح باقی می‌ماند.
                </p>
            </div>
        </div>
    );
};

export default CategoryNotice;
