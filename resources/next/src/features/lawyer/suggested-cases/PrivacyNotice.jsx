import { Info } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const PrivacyNotice = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} mb-4 flex items-start justify-between gap-4 rounded-2xl border border-[#cfe1e7] bg-[#f2f9fb] px-5 py-4`}
        >
            <div className="text-right">
                <h3 className="font-bold text-[#36545d]">
                    محرمانگی پیش از همکاری
                </h3>

                <p className="mt-2 leading-6 text-[#718187]">
                    نام کامل موکل، شماره تماس، نشانی و اسناد کامل تا ایجاد رابطه
                    همکاری قابل مشاهده نیست.
                </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#54747d]">
                <Info size={17} strokeWidth={1.8} />
            </div>
        </section>
    );
};

export default PrivacyNotice;
