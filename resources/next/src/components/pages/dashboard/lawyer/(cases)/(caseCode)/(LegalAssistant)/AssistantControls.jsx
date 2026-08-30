import { CheckSquare2, Info } from 'lucide-react';

import { assistantControls } from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(LegalAssistant)/assistantData';

function formatPersianDate(date) {
    return new Date(date).toLocaleString('fa-IR', {
        calendar: 'persian',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function AssistantControls({ history }) {
    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="border-b border-[#edf1ef] pb-5">
                <h2 className="text-xl font-bold text-[#123b34]">
                    کنترل‌های الزامی
                </h2>
            </header>

            <div className="mt-5 space-y-4">
                {assistantControls.map((control) => (
                    <div key={control} className="flex items-start gap-3">
                        <CheckSquare2
                            size={18}
                            className="mt-0.5 shrink-0 text-[#0b5648]"
                        />

                        <p className="text-sm leading-7 text-[#52635e]">
                            {control}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                    <Info size={19} />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-[#183d36]">
                        تاریخچه اصلاح
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-[#71817d]">
                        پیشنهاد دستیار، اصلاح وکیل، زمان و فرد اصلاح‌کننده در
                        تاریخچه ثبت می‌شود.
                    </p>
                </div>
            </div>

            {history.length > 0 && (
                <div className="mt-5">
                    <h3 className="text-sm font-bold text-[#183d36]">
                        فعالیت‌های اخیر
                    </h3>

                    <div className="mt-3 space-y-2">
                        {history.slice(0, 3).map((item) => (
                            <article
                                key={item.id}
                                className="rounded-xl border border-[#e3eae7] bg-[#fafcfb] p-3"
                            >
                                <p className="text-xs font-bold text-[#183d36]">
                                    {item.title}
                                </p>

                                <time
                                    dateTime={item.createdAt}
                                    className="mt-1 block text-[11px] text-[#879590]"
                                >
                                    {formatPersianDate(item.createdAt)}
                                </time>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
