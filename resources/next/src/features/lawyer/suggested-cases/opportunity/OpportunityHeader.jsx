import Link from 'next/link';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const OpportunityHeader = ({ id }) => {
    return (
        <section className={`${vazir.className} mb-7`}>
            {/* Breadcrumb */}
            <div className="mb-5 flex items-center justify-end gap-2">
                <span className="text-[#8b9590]">پرونده‌های پیشنهادی</span>

                <span className="text-[#b6beb9]">/</span>

                <span className="font-bold text-[#344b45]">{id}</span>
            </div>

            {/* عنوان */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <Link
                    href="/lawyer/send-proposal"
                    className="w-fit rounded-xl bg-[#123f37] px-5 py-3 font-bold text-white shadow-[0_8px_20px_rgba(18,63,55,0.12)] transition hover:-translate-y-1 hover:bg-[#1d5147]"
                >
                    ارسال پیشنهاد همکاری
                </Link>

                <div className="text-right">
                    <h1 className="font-black text-[#123f37]">مطالبه وجه چک</h1>

                    <p className="mt-3 leading-7 text-[#7c8581]">
                        اطلاعات حداقلی برای تصمیم درباره ارسال پیشنهاد همکاری.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default OpportunityHeader;
