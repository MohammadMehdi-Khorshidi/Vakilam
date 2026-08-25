import {
    Phone,
    Video,
    ShieldCheck,
    Info,
} from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const ContactSidebar = () => {
    return (
        <aside
            dir="rtl"
            className={`${vazirmatn.className} space-y-4`}
        >
            {/* اطلاعات وکیل */}
            <div className="rounded-[18px] border border-[#dfe7e3] bg-white p-5 shadow-[0_5px_20px_rgba(18,63,55,0.035)]">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#123f37] font-extrabold text-white">
                        و
                    </div>

                    <div>
                        <h2 className="font-extrabold text-[#173f38]">
                            وکیل پرونده
                        </h2>

                        <p className="mt-1 text-[#899691]">
                            وکیل پایه یک دادگستری
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce6e2] px-4 py-3 font-bold text-[#123f37] transition hover:bg-[#f1f6f3]"
                    >
                        <Phone size={17} />
                        تماس صوتی
                    </button>

                    <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123f37] px-4 py-3 font-bold text-white transition hover:bg-[#0d302a]"
                    >
                        <Video size={17} />
                        تماس تصویری
                    </button>
                </div>
            </div>

            {/* محرمانگی */}
            <div className="rounded-[18px] border border-[#dce8e4] bg-[#f1f7f4] p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#123f37]">
                        <ShieldCheck size={18} />
                    </div>

                    <div className="text-right">
                        <h3 className="font-extrabold text-[#173f38]">
                            ارتباط محرمانه
                        </h3>

                        <p className="mt-2 leading-7 text-[#71817c]">
                            اطلاعات و پیام‌های این گفتگو فقط برای اعضای مجاز
                            پرونده قابل مشاهده است.
                        </p>
                    </div>
                </div>
            </div>

            {/* نکته */}
            <div className="rounded-[18px] border border-[#eadcb8] bg-[#fffaf0] p-5">
                <div className="flex items-start gap-3">
                    <Info
                        size={18}
                        className="mt-0.5 shrink-0 text-[#b28627]"
                    />

                    <p className="leading-7 text-[#806c3f]">
                        برای حفظ امنیت پرونده، اطلاعات حساس را خارج از سامانه
                        ارسال نکنید.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default ContactSidebar;
