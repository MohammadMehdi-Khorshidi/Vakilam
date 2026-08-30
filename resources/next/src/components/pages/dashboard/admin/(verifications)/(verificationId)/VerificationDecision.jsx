'use client';

import { useState } from 'react';

export default function VerificationDecision() {
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');

    const handleAction = (action) => {
        if (!note.trim()) {
            setMessage('ثبت دلیل برای تصمیم مدیر الزامی است.');
            return;
        }

        setMessage(`تصمیم «${action}» با موفقیت ثبت شد.`);
    };

    return (
        <section className="mt-5 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            {/* Header */}

            <div className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    تصمیم مدیر
                </h2>
            </div>

            {/* Note */}

            <div className="mt-4">
                <label
                    htmlFor="decision-note"
                    className="mb-2 block text-sm font-bold text-[#263f38]"
                >
                    یادداشت و دلیل تصمیم
                </label>

                <textarea
                    id="decision-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={5}
                    placeholder="ثبت دلیل برای هر تصمیم الزامی است..."
                    className="w-full resize-none rounded-xl border border-[#d4ddd8] bg-white px-4 py-3 text-sm leading-7 text-[#263f38] outline-none transition placeholder:text-[#a2aaa6] focus:border-[#17463c] focus:ring-2 focus:ring-[#17463c]/10"
                />
            </div>

            {/* Actions */}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                    type="button"
                    onClick={() => handleAction('تأیید و فعال‌سازی')}
                    className="min-h-11 rounded-xl bg-[#123f37] px-5 text-xs font-bold text-white transition hover:bg-[#0e332d]"
                >
                    تأیید و فعال‌سازی
                </button>

                <button
                    type="button"
                    onClick={() => handleAction('اعلام نقص مدرک')}
                    className="min-h-11 rounded-xl border border-[#d4a447] bg-[#fffaf0] px-5 text-xs font-bold text-[#73551e] transition hover:bg-[#fdf3dd]"
                >
                    اعلام نقص مدرک
                </button>

                <button
                    type="button"
                    onClick={() => handleAction('رد درخواست')}
                    className="min-h-11 rounded-xl bg-[#b94747] px-5 text-xs font-bold text-white transition hover:bg-[#a53d3d]"
                >
                    رد درخواست
                </button>

                <button
                    type="button"
                    onClick={() => handleAction('تعلیق')}
                    className="min-h-11 rounded-xl border border-[#dce4df] bg-white px-5 text-xs font-bold text-[#52635c] transition hover:bg-[#f5f8f6]"
                >
                    تعلیق
                </button>

                <button
                    type="button"
                    onClick={() => handleAction('رفع تعلیق')}
                    className="min-h-11 rounded-xl border border-[#dce4df] bg-white px-5 text-xs font-bold text-[#52635c] transition hover:bg-[#f5f8f6]"
                >
                    رفع تعلیق
                </button>
            </div>

            {/* Message */}

            {message && (
                <div className="mt-4 rounded-xl border border-[#dce4df] bg-[#f6faf8] px-4 py-3">
                    <p className="text-xs font-bold text-[#17463c]">
                        {message}
                    </p>
                </div>
            )}
        </section>
    );
}
