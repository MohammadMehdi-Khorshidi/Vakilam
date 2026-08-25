import { FileText, CheckCircle2, Clock3 } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const statusStyles = {
    نهایی: {
        className: 'border-[#cce4d8] bg-[#f0f8f4] text-[#277356]',
        icon: CheckCircle2,
    },

    تأییدشده: {
        className: 'border-[#cce4d8] bg-[#f0f8f4] text-[#277356]',
        icon: CheckCircle2,
    },

    بررسی‌شده: {
        className: 'border-[#cfe4e8] bg-[#f1f8fa] text-[#397889]',
        icon: CheckCircle2,
    },

    'نیازمند بررسی': {
        className: 'border-[#eadcb8] bg-[#fff9e9] text-[#ad8227]',
        icon: Clock3,
    },
};

const DocumentCard = ({ title, type, category, status }) => {
    const statusData = statusStyles[status] || statusStyles['نهایی'];

    const StatusIcon = statusData.icon;

    return (
        <article
            dir="rtl"
            className={`${vazirmatn.className} group rounded-[17px] border border-[#dfe7e3] bg-white p-4 transition-all duration-200 hover:-translate-y-[1px] hover:border-[#c8d6d0] hover:shadow-[0_10px_25px_rgba(18,63,55,0.07)]`}
        >
            <div className="flex items-center justify-between gap-4">
                {/* اطلاعات سند */}
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#edf4f1] text-[#123f37] transition-colors duration-200 group-hover:bg-[#e5efeb]">
                        <FileText size={20} strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0 text-right">
                        <h3 className="truncate  font-extrabold text-[#193f38]">
                            {title}
                        </h3>

                        <p className="mt-1 text-[10px] text-[#899691]">
                            {category} · {type.toUpperCase()}
                        </p>

                        <div
                            className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusData.className}`}
                        >
                            <StatusIcon size={11} />

                            <span>{status}</span>
                        </div>
                    </div>
                </div>

                {/* دکمه پیش‌نمایش */}
                <button
                    type="button"
                    className="shrink-0 rounded-[10px] border border-[#d5e0dc] bg-white px-4 py-2 text-[10px] font-bold text-[#294e46] transition-all duration-200 hover:border-[#123f37] hover:bg-[#123f37] hover:text-white"
                >
                    پیش‌نمایش امن
                </button>
            </div>
        </article>
    );
};

export default DocumentCard;
