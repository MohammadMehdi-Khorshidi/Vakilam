'use client';

import { Vazirmatn } from 'next/font/google';
import { UserRound, BriefcaseBusiness, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const PartiesCard = () => {
    const { user } = useAuth();
    const clientName = [user?.name, user?.last_name].filter(Boolean).join(' ').trim() || 'موکل';

    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            <div className="border-b border-[#edf1ef] pb-4">
                <h2 className=" font-extrabold text-[#173f37]">
                    طرفین همکاری
                </h2>
            </div>

            <div className="mt-4 flex items-center gap-3">
                {/* Lawyer */}
                <div className="flex flex-1 items-center gap-3 rounded-[15px] border border-[#dfe8e3] bg-[#fafcfb] px-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6f1e5] text-[#173f37]">
                        <BriefcaseBusiness size={18} />
                    </div>

                    <div>
                        <p className=" text-[#8a9994]">وکیل</p>

                        <p className="mt-1 font-extrabold text-[#173f37]">
                            وکیل منتخب
                        </p>

                        <p className="mt-1 text-[#8a9994]">
                            وکیل احراز شده
                        </p>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-[#8c9b95]">
                    <ArrowLeftRight size={17} />
                </div>

                {/* Client */}
                <div className="flex flex-1 items-center gap-3 rounded-[15px] border border-[#dfe8e3] bg-[#fafcfb] px-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6f1e5] text-[#173f37]">
                        <UserRound size={18} />
                    </div>

                    <div>
                        <p className=" text-[#8a9994]">موکل</p>

                        <p className="mt-1 font-extrabold text-[#173f37]">
                            {clientName}
                        </p>

                        <p className="mt-1 text-[#8a9994]">
                            هویت تأییدشده
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartiesCard;
