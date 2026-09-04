'use client';

import { FileText, Upload, X } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepDocuments({ data, update }) {
    const addDemoFile = () => {
        const fileName = `مدرک-${data.documents.length + 1}.pdf`;

        update('documents', [...data.documents, fileName]);
    };

    const removeFile = (fileName) => {
        update(
            'documents',
            data.documents.filter((item) => item !== fileName),
        );
    };

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

            {data.documents.map((file) => (
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
