'use client';

import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const NewProposal = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="border-b border-[#edf1ef] pb-4">
                <h2 className=" font-extrabold text-[#173f37]">
                    پیشنهاد همکاری جدید
                </h2>
            </div>

            {/* Description */}
            <div className="mt-4">
                <p className="text-right  leading-7 text-[#687873]">
                    این وکیل برای پرونده «مطالبه وجه چک» پیشنهاد همکاری ارسال
                    کرده است. پیشنهاد شامل بررسی مدارک، تنظیم دادخواست، پیگیری
                    مرحله بدوی و اجرای رأی است.
                </p>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                <button
                    type="button"
                    className="rounded-xl bg-[#0d4a3e] px-5 py-3  font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#123f37]"
                >
                    مشاهده پیشنهاد
                </button>

                <button
                    type="button"
                    className="rounded-xl border border-[#d8e2de] bg-white px-5 py-3  font-bold text-[#315e52] transition hover:border-[#c9a96e] hover:bg-[#faf8f2]"
                >
                    علامت‌گذاری به‌عنوان خوانده‌شده
                </button>
            </div>
        </section>
    );
};

export default NewProposal;
