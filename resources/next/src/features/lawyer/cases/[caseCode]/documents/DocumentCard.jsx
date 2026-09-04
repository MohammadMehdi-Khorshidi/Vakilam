'use client';

import { Eye, File, FileImage, FileText, Trash2 } from 'lucide-react';

function formatFileSize(bytes) {
    if (!bytes) {
        return '۰ بایت';
    }

    const units = ['بایت', 'کیلوبایت', 'مگابایت'];

    const unitIndex = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );

    const value = bytes / 1024 ** unitIndex;

    return `${new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 1,
}).format(value)} ${units[unitIndex]}`;
}

function DocumentFileIcon({ type }) {
    if (type?.startsWith('image/')) {
        return <FileImage size={22} />;
    }

    if (type === 'application/pdf') {
        return <FileText size={22} />;
    }

    return <File size={22} />;
}

export default function DocumentCard({
    document,
    onPreview,
    onDelete,
}) {
    return (
        <article className="flex flex-col justify-between gap-4 rounded-xl border border-[#e3eae7] bg-white p-5 transition hover:border-[#bfd0ca] sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf6f2] text-[#0b5648]">
                    <DocumentFileIcon type={document.type} />
                </div>

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#183d36]">
                        {document.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#879590]">
                        <span>{document.id}</span>

                        <span>·</span>

                        <span>{formatFileSize(document.size)}</span>

                        <span>·</span>

                        <time dateTime={document.uploadedAt}>
                            {new Date(
                                document.uploadedAt,
                            ).toLocaleString('fa-IR', {
                                calendar: 'persian',
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </time>
                    </div>

                    <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        بارگذاری شد
                    </span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onPreview(document)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dce6e2] px-4 py-2.5 text-sm font-bold text-[#183d36] transition hover:bg-[#f5f8f6]"
                >
                    <Eye size={17} />
                    پیش‌نمایش
                </button>

                <button
                    type="button"
                    onClick={() => onDelete(document.id)}
                    className="grid size-10 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                    aria-label="حذف فایل"
                >
                    <Trash2 size={17} />
                </button>
            </div>
        </article>
    );
}
