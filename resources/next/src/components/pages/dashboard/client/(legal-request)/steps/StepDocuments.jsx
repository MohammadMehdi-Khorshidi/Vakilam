'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400', '500', '600', '700', '800'] });

export default function StepDocuments({ data, update, onUpload }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const documents = Array.isArray(data.documents) ? data.documents : [];

    async function handleFiles(files) {
        const file = files?.[0];
        if (!file) return;
        setError('');
        setUploading(true);
        try {
            const document = await onUpload(file);
            const item = {
                id: document?.id ?? document?.public_id ?? `${file.name}-${Date.now()}`,
                name: document?.title ?? file.name,
            };
            update('documents', [...documents, item]);
        } catch (err) {
            setError(err.message || 'بارگذاری مدرک ناموفق بود.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div dir="rtl" className={vazir.className}>
            <div className="rounded-2xl border-2 border-dashed p-10 text-center">
                <Upload className="mx-auto mb-3 text-[#0b4138]" />
                <b>مدرک پرونده را انتخاب کنید</b>
                <p className="my-2 text-xs text-slate-500">PDF، JPG یا PNG — حداکثر ۵ مگابایت</p>
                <input ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="mt-3 rounded-xl border px-5 py-3 text-sm font-bold disabled:opacity-50">
                    {uploading ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin"/>در حال بارگذاری...</span> : 'انتخاب فایل'}
                </button>
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            {documents.map((file) => (
                <div key={file.id ?? file.name} className="mt-2 flex items-center justify-between rounded-xl bg-[#e8f2ef] p-3">
                    <span className="flex items-center gap-2"><FileText size={18}/>{file.name ?? file.title ?? 'مدرک'}</span>
                    <button type="button" onClick={() => update('documents', documents.filter((item) => item !== file))}><X size={16}/></button>
                </div>
            ))}
        </div>
    );
}
