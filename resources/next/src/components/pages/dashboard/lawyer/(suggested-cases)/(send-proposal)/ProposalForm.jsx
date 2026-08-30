'use client';

import { useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import ProposalActions from '@/components/pages/dashboard/lawyer/(suggested-cases)/(send-proposal)/ProposalActions';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ProposalForm = () => {
    const [form, setForm] = useState({
        totalFee: '۴۸,۰۰۰,۰۰۰ تومان',
        proposedFee: '۱۸,۰۰۰,۰۰۰ تومان',
        startTime: 'طی ۲ روز کاری',
        duration: '۴ تا ۶ ماه',
        services:
            'بررسی مدارک، انتخاب مسیر مناسب، تنظیم دادخواست، پیگیری مرحله بدوی و اجرای رأی',
        description:
            'برآورد زمان قطعی نیست و به ابلاغ‌ها، دفاع طرف مقابل و روند مرجع رسیدگی وابسته است.',
        acceptedResult: true,
        externalContact: true,
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[22px] border border-[#e1e8e4] bg-white p-5 shadow-[0_5px_25px_rgba(18,63,55,0.04)] sm:p-7`}
        >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* حق‌الوکاله کل */}
                <div>
                    <label className="mb-2 block font-bold text-[#344b45]">
                        حق‌الوکاله کل
                    </label>

                    <input
                        type="text"
                        value={form.totalFee}
                        onChange={(e) =>
                            handleChange('totalFee', e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dce5e0] bg-white px-4 py-3 text-right text-[#173b34] outline-none transition focus:border-[#9bb9ad] focus:ring-2 focus:ring-[#edf4f0]"
                    />
                </div>

                {/* پیشنهاد پرداخت پیشنهادی */}
                <div>
                    <label className="mb-2 block font-bold text-[#344b45]">
                        پیش‌پرداخت پیشنهادی
                    </label>

                    <input
                        type="text"
                        value={form.proposedFee}
                        onChange={(e) =>
                            handleChange('proposedFee', e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dce5e0] bg-white px-4 py-3 text-right text-[#173b34] outline-none transition focus:border-[#9bb9ad] focus:ring-2 focus:ring-[#edf4f0]"
                    />
                </div>

                {/* زمان شروع */}
                <div>
                    <label className="mb-2 block font-bold text-[#344b45]">
                        زمان شروع
                    </label>

                    <select
                        value={form.startTime}
                        onChange={(e) =>
                            handleChange('startTime', e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dce5e0] bg-white px-4 py-3 text-right text-[#173b34] outline-none transition focus:border-[#9bb9ad] focus:ring-2 focus:ring-[#edf4f0]"
                    >
                        <option>طی ۲ روز کاری</option>
                        <option>طی ۳ روز کاری</option>
                        <option>طی یک هفته</option>
                    </select>
                </div>

                {/* برآورد مدت */}
                <div>
                    <label className="mb-2 block font-bold text-[#344b45]">
                        برآورد مدت
                    </label>

                    <input
                        type="text"
                        value={form.duration}
                        onChange={(e) =>
                            handleChange('duration', e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dce5e0] bg-white px-4 py-3 text-right text-[#173b34] outline-none transition focus:border-[#9bb9ad] focus:ring-2 focus:ring-[#edf4f0]"
                    />
                </div>
            </div>

            {/* محدوده خدمات */}
            <div className="mt-5">
                <label className="mb-2 block font-bold text-[#344b45]">
                    محدوده خدمات
                </label>

                <textarea
                    rows={5}
                    value={form.services}
                    onChange={(e) => handleChange('services', e.target.value)}
                    className="w-full resize-none rounded-xl border border-[#dce5e0] bg-white px-4 py-4 text-right leading-7 text-[#173b34] outline-none transition focus:border-[#9bb9ad] focus:ring-2 focus:ring-[#edf4f0]"
                />
            </div>

            {/* توضیح تکمیلی */}
            <div className="mt-5">
                <label className="mb-2 block font-bold text-[#344b45]">
                    توضیح تکمیلی
                </label>

                <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) =>
                        handleChange('description', e.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-[#dce5e0] bg-white px-4 py-4 text-right leading-7 text-[#173b34] outline-none transition focus:border-[#9bb9ad] focus:ring-2 focus:ring-[#edf4f0]"
                />
            </div>

            {/* تاییدها */}
            <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-center justify-end gap-3 text-right text-[#596762]">
                    <span>در پیشنهاد خود نتیجه پرونده را تضمین نمی‌کنم.</span>

                    <input
                        type="checkbox"
                        checked={form.acceptedResult}
                        onChange={(e) =>
                            handleChange('acceptedResult', e.target.checked)
                        }
                        className="h-4 w-4 accent-[#123f37]"
                    />
                </label>

                <label className="flex cursor-pointer items-center justify-end gap-3 text-right text-[#596762]">
                    <span>
                        اطلاعات تماس یا پیشنهاد همکاری خارج از وکیلم درج
                        نکرده‌ام.
                    </span>

                    <input
                        type="checkbox"
                        checked={form.externalContact}
                        onChange={(e) =>
                            handleChange('externalContact', e.target.checked)
                        }
                        className="h-4 w-4 accent-[#123f37]"
                    />
                </label>
            </div>

            <ProposalActions/>
        </section>
    );
};

export default ProposalForm;
