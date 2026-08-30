import { Info } from 'lucide-react';

import CaseInformationItem from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(GeneralInformation)/CaseInformationItem';

function formatMoney(amount) {
    if (amount === null || amount === undefined) {
        return 'ثبت نشده';
    }

    return `${new Intl.NumberFormat('fa-IR').format(amount / 10)} تومان`;
}

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
        month: '2-digit',
        day: '2-digit',
    }).format(parsedDate);
}

export default function CaseInformation({ caseItem }) {
    const information = caseItem.information;
    const aiReview = caseItem.aiReview;

    if (!information) {
        return (
            <section className="rounded-2xl border border-[#dce6e2] bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-[#75847f]">
                    اطلاعات پرونده موجود نیست.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-5">
            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <header className="border-b border-[#edf1ef] pb-5">
                    <h2 className="text-xl font-bold text-[#123b34]">
                        اطلاعات تأییدشده پرونده
                    </h2>

                    <p className="mt-2 text-sm text-[#879590]">
                        اطلاعات پرونده از رابطه همکاری جدا نگهداری می‌شود.
                    </p>
                </header>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <CaseInformationItem label="خواسته موکل">
                        {information.clientRequest}
                    </CaseInformationItem>

                    <CaseInformationItem label="طرف مقابل">
                        {information.opposingParty}
                    </CaseInformationItem>

                    <CaseInformationItem label="مبلغ">
                        {formatMoney(information.amountRial)}
                    </CaseInformationItem>

                    <CaseInformationItem label="تاریخ سررسید">
                        {formatPersianDate(information.dueDate)}
                    </CaseInformationItem>

                    <CaseInformationItem label="وضعیت گواهی">
                        {information.certificateStatus}
                    </CaseInformationItem>

                    <CaseInformationItem label="وضعیت صیاد">
                        {information.checkStatus}
                    </CaseInformationItem>
                </div>
            </section>

            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <header className="border-b border-[#edf1ef] pb-5">
                    <h2 className="text-xl font-bold text-[#123b34]">
                        کنترل خروجی هوش مصنوعی
                    </h2>
                </header>

                {aiReview?.requiresClientConfirmation && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                            <Info size={19} />
                        </div>

                        <div>
                            <strong className="block text-sm text-[#183d36]">
                                نیازمند تأیید کاربر مجاز
                            </strong>

                            <p className="mt-1 text-xs leading-6 text-[#71817d]">
                                {aiReview.message}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-right">
                        <thead>
                            <tr className="border-b border-[#e3eae7]">
                                <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                    فیلد
                                </th>

                                <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                    پیشنهاد هوش مصنوعی
                                </th>

                                <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                    مقدار تأییدشده
                                </th>

                                <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                    اصلاح‌کننده
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {aiReview?.items?.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-[#edf1ef] last:border-b-0"
                                >
                                    <td className="px-4 py-4 text-sm font-bold text-[#183d36]">
                                        {item.field}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-[#566762]">
                                        {item.aiSuggestion}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-[#183d36]">
                                        {item.approvedValue}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-[#566762]">
                                        {item.correctedBy}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
