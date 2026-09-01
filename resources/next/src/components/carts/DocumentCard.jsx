import {
    CheckCircle2,
    Clock3,
    File,
    FileImage,
    FileText,
} from 'lucide-react';

import {Vazirmatn} from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const statusStyles = {
    نهایی: {
        className: 'border-[#cce4d8] bg-[#f0f8f4] text-[#277356]',
        icon: 'check',
    },

    تأییدشده: {
        className: 'border-[#cce4d8] bg-[#f0f8f4] text-[#277356]',
        icon: 'check',
    },

    بررسی‌شده: {
        className: 'border-[#cfe4e8] bg-[#f1f8fa] text-[#397889]',
        icon: 'check',
    },

    'نیازمند بررسی': {
        className: 'border-[#eadcb8] bg-[#fff9e9] text-[#ad8227]',
        icon: 'clock',
    },
};

const fileIcons = {
    pdf: 'text',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    webp: 'image',
    doc: 'text',
    docx: 'text',
};

function FileTypeIcon({extension}) {
    const normalizedExtension = extension?.toLowerCase();

    const iconType =
        fileIcons[normalizedExtension] || 'file';

    if (iconType === 'image') {
        return <FileImage size={22}/>;
    }

    if (iconType === 'text') {
        return <FileText size={22}/>;
    }

    return <File size={22}/>;
}

function StatusIcon({type}) {
    if (type === 'clock') {
        return <Clock3 size={11}/>;
    }

    return <CheckCircle2 size={11}/>;
}

const DocumentCard = ({
                          document,
                          onPreview,
                          onDelete,
                      }) => {
    if (!document) return null;

    const status = document?.status ?? 'نهایی';

    const statusData =
        statusStyles[status] ||
        statusStyles['نهایی'];

    return (
        <article dir="rtl"
                 className={`${vazirmatn.className} flex flex-col justify-between gap-4 rounded-xl border border-[#e3eae7] bg-white p-5 transition hover:border-[#bfd0ca] sm:flex-row sm:items-center`}>
            <div className="flex min-w-0 items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf6f2] text-[#0b5648]">
                    <FileTypeIcon extension={document?.extension}/>
                </div>

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#183d36]">{document.name}</h3>

                    <p className="mt-1 text-xs text-[#879590]">
                        {document.category || 'مدرک پرونده'} ·{' '}
                        {document.extension?.toUpperCase() || 'FILE'}
                    </p>

                    <div
                        className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusData.className}`}>
                        <StatusIcon type={statusData.icon}/>
                        <span>{status}</span>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => onPreview?.(document)}
                        className="rounded-[10px] border border-[#d5e0dc] bg-white px-4 py-2 text-[10px] font-bold text-[#294e46] transition-all duration-200 hover:border-[#123f37] hover:bg-[#123f37] hover:text-white">
                    پیش‌نمایش امن
                </button>

                <button type="button" onClick={() => onDelete?.(document.id)}
                        className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-2 text-[10px] font-bold text-red-700 transition hover:bg-red-100">
                    حذف
                </button>
            </div>
        </article>
    );
};

export default DocumentCard;
