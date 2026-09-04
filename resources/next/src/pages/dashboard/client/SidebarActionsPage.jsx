'use client';

import { Vazirmatn } from 'next/font/google';
import ActionsList from '@/features/client/actions/ActionsList';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const SidebarActionsPage = () => {
    return (
        <main
            dir="ltr"
            className={`${vazir.className} mt-12 min-h-[calc(100vh-80px)] bg-[#f8faf9]`}
        >
            <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8">
                {/* Page Header */}
                <div className="mb-6">
                    {/* Main title */}
                    <h1 className="text-right text-[28px] font-extrabold leading-[1.7] text-[#103b34] md:text-[34px]">
                        الان چه کاری باید انجام دهید؟
                    </h1>

                    {/* Description */}
                    <p className="mt-2 text-right text-[12px] leading-7 text-[#8a9994]">
                        اقدام‌ها براساس فوریت، وابستگی و وضعیت پرونده مرتب
                        شده‌اند.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="rounded-full border border-[#e3e9e6] bg-white px-5 py-2.5  font-semibold text-[#6f7f79] transition hover:border-[#c9a96e]"
                    >
                        انجام‌شده
                    </button>
                    <button
                        type="button"
                        className="rounded-full border border-[#e3e9e6] bg-white px-5 py-2.5 font-semibold text-[#6f7f79] transition hover:border-[#c9a96e]"
                    >
                        امروز ۲
                    </button>
                    <button
                        type="button"
                        className="rounded-full border border-[#e3e9e6] bg-white px-5 py-2.5  font-semibold text-[#6f7f79] transition hover:border-[#c9a96e]"
                    >
                        فوری ۱
                    </button>
                    <button
                        type="button"
                        className="rounded-full border border-[#c9a96e] bg-white px-5 py-2.5 font-bold text-[#315e52] shadow-sm"
                    >
                        همه ۳
                    </button>
                </div>

                {/* Actions */}
                <ActionsList/>
            </div>
        </main>
    );
};

export default SidebarActionsPage;
