'use client';

import { FileText, Upload, X } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const HAS_DOCUMENT_ANSWER = 'بله، مدرک دارم.';

export default function StepDocuments({ data, update }) {
    const documents = Array.isArray(data.documents) ? data.documents : [];
    const shouldShowUpload = data.answer === HAS_DOCUMENT_ANSWER;

    const addDemoFile = () => {
        const fileName = `مدرک-${documents.length + 1}.pdf`;
        update('documents', [...documents, fileName]);
    };

    const removeFile = (fileName) => {
        update(
            'documents',
            documents.filter((item) => item !== fileName),
        );
    };

    if (!shouldShowUpload) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600`}
            >
                در مرحله قبل اعلام کردید مدرکی برای بارگذاری در اختیار ندارید یا از مدارک موردنیاز مطمئن نیستید؛ می‌توانید بدون بارگذاری فایل ادامه دهید.
            </div>
        );
    }

    return (
        <div dir="rtl" className={vazir.className}>
            <div className="rounded-2xl border-2 border-dashed p-10 text-center">
                <Upload className="mx-auto mb-3 text-[#0b4138]" />

                <b>فایل‌ها را اینجا رها کنید</b>

                <p className="my-2 text-xs text-slate-500">
                    PDF، تصویر یا فایل متنی — حداکثر ۱۰ مگابایت
                </p>

                <button
                    type="button"
                    onClick={addDemoFile}
                    className="mt-3 rounded-xl border px-5 py-3 text-sm font-bold"
                >
                    انتخاب فایل آزمایشی
                </button>
            </div>

            {documents.map((file) => (
                <div
                    key={file}
                    className="mt-2 flex items-center justify-between rounded-xl bg-[#e8f2ef] p-3"
                >
                    <span className="flex items-center gap-2">
                        <FileText size={18} />
                        {file}
                    </span>

                    <button type="button" onClick={() => removeFile(file)}>
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
