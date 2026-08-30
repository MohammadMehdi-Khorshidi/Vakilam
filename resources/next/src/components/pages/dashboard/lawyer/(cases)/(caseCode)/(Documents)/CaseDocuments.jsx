'use client';

import Image from 'next/image';
import { File, FileText, Info, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import DocumentCard from './DocumentCard';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const acceptedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function createDocumentId() {
    return `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getFileExtension(fileName) {
    return fileName.split('.').pop()?.toLowerCase();
}

export default function CaseDocuments({ caseItem }) {
    const inputRef = useRef(null);
    const objectUrlsRef = useRef(new Set());

    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const objectUrls = objectUrlsRef.current;

        return () => {
            objectUrls.forEach((url) => {
                URL.revokeObjectURL(url);
            });

            objectUrls.clear();
        };
    }, []);

    function validateFile(file) {
        if (!acceptedFileTypes.includes(file.type)) {
            return `فرمت فایل «${file.name}» مجاز نیست.`;
        }

        if (file.size > MAX_FILE_SIZE) {
            return `حجم فایل «${file.name}» بیشتر از ۱۰ مگابایت است.`;
        }

        return null;
    }

    function addFiles(fileList) {
        const files = Array.from(fileList);

        if (!files.length) {
            return;
        }

        const newDocuments = [];
        const errors = [];

        files.forEach((file) => {
            const validationError = validateFile(file);

            if (validationError) {
                errors.push(validationError);
                return;
            }

            const alreadyExists = documents.some(
                (document) =>
                    document.name === file.name && document.size === file.size,
            );

            if (alreadyExists) {
                errors.push(`فایل «${file.name}» قبلاً انتخاب شده است.`);
                return;
            }

            const previewUrl = URL.createObjectURL(file);

            objectUrlsRef.current.add(previewUrl);

            newDocuments.push({
                id: createDocumentId(),
                name: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
                extension: getFileExtension(file.name),
                uploadedAt: new Date().toISOString(),
                previewUrl,
                file,
            });
        });

        if (newDocuments.length) {
            setDocuments((currentDocuments) => [
                ...currentDocuments,
                ...newDocuments,
            ]);
        }

        setError(errors.join('\n'));

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    function handleInputChange(event) {
        addFiles(event.target.files);
    }

    function handleDragOver(event) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        setIsDragging(false);

        addFiles(event.dataTransfer.files);
    }

    function handleDelete(documentId) {
        const confirmed = window.confirm('آیا از حذف این سند مطمئن هستید؟');

        if (!confirmed) {
            return;
        }

        setDocuments((currentDocuments) => {
            const targetDocument = currentDocuments.find(
                (document) => document.id === documentId,
            );

            if (targetDocument?.previewUrl) {
                URL.revokeObjectURL(targetDocument.previewUrl);

                objectUrlsRef.current.delete(targetDocument.previewUrl);
            }

            return currentDocuments.filter(
                (document) => document.id !== documentId,
            );
        });

        if (selectedDocument?.id === documentId) {
            setSelectedDocument(null);
        }
    }

    return (
        <div className="space-y-5">
            <section className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                    <Info size={19} />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-[#183d36]">
                        محرمانگی و حداقل دسترسی
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[#71817d]">
                        این فهرست فقط اسناد همین پرونده را نشان می‌دهد. استفاده
                        از اسناد خارج از هدف همکاری مجاز نیست.
                    </p>
                </div>
            </section>

            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <header className="flex flex-col justify-between gap-4 border-b border-[#edf1ef] pb-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#123b34]">
                            اسناد و مدارک همین پرونده
                        </h2>

                        <p className="mt-2 text-sm text-[#879590]">
                            {documents.length.toLocaleString('fa-IR')} فایل
                            انتخاب شده است.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#d8b45d] bg-[#fffaf0] px-4 py-3 text-sm font-bold text-[#183d36] transition hover:bg-[#fff5dc]"
                    >
                        <UploadCloud size={18} />
                        بارگذاری سند
                    </button>
                </header>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={handleInputChange}
                    className="hidden"
                />

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();

                            inputRef.current?.click();
                        }
                    }}
                    className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                        isDragging
                            ? 'border-[#0b5648] bg-[#edf6f2]'
                            : 'border-[#cfdbd7] bg-[#fafcfb] hover:border-[#0b5648]'
                    }`}
                >
                    <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf6f2] text-[#0b5648]">
                        <UploadCloud size={26} />
                    </div>

                    <h3 className="mt-4 text-base font-bold text-[#183d36]">
                        فایل‌ها را اینجا رها کنید
                    </h3>

                    <p className="mt-2 text-sm text-[#879590]">
                        یا برای انتخاب فایل کلیک کنید
                    </p>

                    <p className="mt-3 text-xs text-[#9aa6a2]">
                        PDF، JPG، PNG، WEBP، DOC و DOCX تا حداکثر ۱۰ مگابایت
                    </p>
                </div>

                {error && (
                    <div className="mt-4 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                    {documents.map((document) => (
                        <DocumentCard
                            key={document.id}
                            document={document}
                            onPreview={setSelectedDocument}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                {!documents.length && (
                    <div className="mt-5 rounded-xl border border-dashed border-[#dce6e2] py-10 text-center">
                        <FileText
                            size={28}
                            className="mx-auto text-[#94a09d]"
                        />

                        <p className="mt-3 text-sm text-[#879590]">
                            هنوز سندی انتخاب نشده است.
                        </p>
                    </div>
                )}
            </section>

            {selectedDocument && (
                <DocumentPreviewModal
                    document={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                />
            )}
        </div>
    );
}

function DocumentPreviewModal({ document, onClose }) {
    const isImage = document.type?.startsWith('image/');

    const isPdf = document.type === 'application/pdf';

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
            onMouseDown={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-5 shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="flex items-start justify-between gap-4 border-b border-[#edf1ef] pb-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-[#123b34]">
                            {document.name}
                        </h2>

                        <p className="mt-1 text-xs text-[#879590]">
                            پیش‌نمایش امن سند
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#dce6e2] transition hover:bg-[#f5f8f6]"
                        aria-label="بستن"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="mt-5 min-h-0 flex-1 overflow-auto rounded-xl bg-[#f5f8f6]">
                    {isImage && (
                        <div className="relative mx-auto h-[70vh] min-h-[300px] w-full max-w-4xl">
                            <Image
                                src={document.previewUrl}
                                alt={document.name}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 100vw, 1024px"
                                className="object-contain"
                            />
                        </div>
                    )}

                    {isPdf && (
                        <iframe
                            src={document.previewUrl}
                            title={document.name}
                            className="h-[70vh] w-full border-0"
                        />
                    )}

                    {!isImage && !isPdf && (
                        <div className="grid min-h-80 place-items-center p-8 text-center">
                            <div>
                                <File
                                    size={42}
                                    className="mx-auto text-[#0b5648]"
                                />

                                <h3 className="mt-4 font-bold text-[#183d36]">
                                    پیش‌نمایش این فرمت در مرورگر پشتیبانی
                                    نمی‌شود.
                                </h3>

                                <a
                                    href={document.previewUrl}
                                    download={document.name}
                                    className="mt-5 inline-flex rounded-xl bg-[#0b5648] px-5 py-3 text-sm font-bold text-white"
                                >
                                    دریافت فایل
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
