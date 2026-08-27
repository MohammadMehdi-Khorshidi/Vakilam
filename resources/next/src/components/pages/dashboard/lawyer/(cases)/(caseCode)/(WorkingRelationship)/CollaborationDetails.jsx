import { Info } from 'lucide-react';
import CollaborationItem from './CollaborationItem';


function formatPersianDate(date) {
    if (!date) {
        return 'ثبت نشده';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'تاریخ نامعتبر';
    }

    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(parsedDate);
}

export default function CollaborationDetails({ caseItem }) {
    const collaboration = caseItem.collaboration;

    if (!collaboration) {
        return (
            <section className="rounded-2xl border border-[#dce6e2] bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-[#75847f]">
                    برای این پرونده رابطه همکاری ثبت نشده است.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-5">
            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <header className="border-b border-[#edf1ef] pb-5">
                    <h2 className="text-xl font-bold text-[#123b34]">
                        رابطه همکاری جاری
                    </h2>

                    <p className="mt-2 text-sm text-[#879590]">
                        شناسه {collaboration.code}
                    </p>
                </header>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <CollaborationItem label="وضعیت همکاری">
                        <span className="inline-flex items-center gap-2 text-emerald-700">
                            <span className="size-2 rounded-full bg-emerald-500" />

                            {collaboration.status}
                        </span>
                    </CollaborationItem>

                    <CollaborationItem label="تاریخ شروع">
                        {formatPersianDate(collaboration.startedAt)}
                    </CollaborationItem>

                    <CollaborationItem label="وضعیت قرارداد">
                        {collaboration.contractStatus}
                    </CollaborationItem>

                    <CollaborationItem label="وضعیت مالی">
                        {collaboration.financialStatus}
                    </CollaborationItem>
                </div>

                <div className="mt-4 rounded-xl border border-r-4 border-[#ead3a1] bg-[#fffaf0] px-5 py-4">
                    <span className="block text-xs font-bold text-[#a47b2c]">
                        محدوده خدمات وکیل
                    </span>

                    <p className="mt-2 text-sm leading-8 text-[#52635e]">
                        {collaboration.serviceScope}
                    </p>
                </div>
            </section>

            <section className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                    <Info size={19} />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-[#183d36]">
                        تفکیک پرونده و همکاری
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[#71817d]">
                        ممکن است یک پرونده در طول زمان چند رابطه همکاری داشته
                        باشد. وکیل فقط رابطه همکاری و داده‌های مجاز مربوط به
                        خودش را می‌بیند.
                    </p>
                </div>
            </section>
        </div>
    );
}
