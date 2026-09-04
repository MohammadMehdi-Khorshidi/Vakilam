import { Phone, Video } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const ContactMethods = () => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfe7e3] bg-white p-5 shadow-[0_5px_20px_rgba(18,63,55,0.035)]`}
        >
            <div className="mb-5 border-b border-[#e8eeeb] pb-4">
                <h2 className="font-extrabold text-[#173f38]">
                    تماس داخل سامانه
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* تماس تصویری */}
                <button
                    type="button"
                    className="group order-1 flex min-h-[130px] flex-col items-center justify-center rounded-[16px] border border-[#e2e9e6] bg-white p-5 transition-all duration-200 hover:border-[#d8bb82] hover:shadow-[0_5px_18px_rgba(18,63,55,0.06)] md:order-2"
                >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#123f37] text-white transition-all duration-200 group-hover:bg-[#0d302a]">
                        <Video size={21} strokeWidth={1.9} />
                    </div>

                    <h3 className="font-extrabold text-[#173f38]">
                        تماس تصویری
                    </h3>

                    <p className="mt-2 text-[#899691]">
                        داخل محیط کنترل‌شده وکیلم
                    </p>
                </button>

                {/* تماس صوتی */}
                <button
                    type="button"
                    className="group order-2 flex min-h-[130px] flex-col items-center justify-center rounded-[16px] border border-[#e2e9e6] bg-white p-5 transition-all duration-200 hover:border-[#d8bb82] hover:shadow-[0_5px_18px_rgba(18,63,55,0.06)] md:order-1"
                >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#123f37] text-white transition-all duration-200 group-hover:bg-[#0d302a]">
                        <Phone size={21} strokeWidth={1.9} />
                    </div>

                    <h3 className="font-extrabold text-[#173f38]">تماس صوتی</h3>

                    <p className="mt-2 text-[#899691]">
                        شماره واقعی طرفین داده نمی‌شود
                    </p>
                </button>
            </div>

            {/* حفظ سوابق */}
            <div className="mt-4 rounded-[15px] border border-[#cfe5ee] bg-[#eff8fc] px-4 py-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-bold text-[#477987]">
                        i
                    </div>

                    <div className="text-right">
                        <h3 className="font-bold text-[#294d54]">حفظ سوابق</h3>

                        <p className="mt-1 leading-6 text-[#70878d]">
                            زمان تماس و جلسه ثبت می‌شود؛ محتوای تماس فقط طبق
                            سیاست و ضوابط لازم پردازش خواهد شد.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactMethods;
