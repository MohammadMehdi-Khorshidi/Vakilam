'use client';

import { Vazirmatn } from 'next/font/google';
import { TriangleAlert } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const AssistantNotice = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[16px] border border-[#ecdba9] bg-[#fffaf0] p-4`}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#b28b43]">
                    <TriangleAlert size={16} />
                </div>

                <div>
                    <h3 className=" font-extrabold text-[#5f5030]">
                        حدود پاسخ‌گویی
                    </h3>

                    <p className="mt-1 leading-6 text-[#8a8068]">
                        دستیار نتیجه پرونده را تضمین نمی‌کند و ثبت درخواست یا
                        انتخاب مسیر نهایی باید پس از بررسی کامل و تأیید کاربر
                        انجام شود.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AssistantNotice;
