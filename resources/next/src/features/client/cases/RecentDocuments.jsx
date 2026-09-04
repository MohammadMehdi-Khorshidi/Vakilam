import { FileText } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const statusStyles = {
    نهایی: 'border-[#cce9dc] bg-[#effaf4] text-[#27805a]',
    بررسی‌شده: 'border-[#cceaf2] bg-[#f0f9fc] text-[#357f91]',
    'نیازمند بررسی': 'border-[#f1dfb5] bg-[#fff9e9] text-[#b28627]',
};

const RecentDocuments = ({ documents = [] }) => {
    return (
        <section
            dir="ltr"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfe7e4] bg-white p-5 shadow-[0_4px_18px_rgba(18,63,55,0.035)]`}
        >
            <h2 className="font-extrabold text-[#173f38]">اسناد اخیر</h2>

            <div className="my-4 h-px bg-[#edf1ef]" />

            <div className="space-y-2">
                {documents.slice(0, 2).map((document) => (
                    <div
                        key={document.id}
                        className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e2e9e6] px-3 py-3"
                    >
                        <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                                statusStyles[document.status] ||
                                statusStyles['نهایی']
                            }`}
                        >
                            {document.status}
                        </span>

                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fff1f2] text-[#243d38]">
                                <FileText size={16} />
                            </div>

                            <div className="min-w-0 text-right">
                                <p className="truncate font-bold text-[#294e46]">
                                    {document.title}
                                </p>

                                <span className="text-xs text-[#899591]">
                                    {document.category}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" className="mt-3 font-bold text-[#176154]">
                مشاهده همه اسناد
            </button>
        </section>
    );
};

export default RecentDocuments;
