'use client';

import { useState } from 'react';

export default function CaseDecision() {
    const [note, setNote] = useState('');

    return (
        <section className="mt-5 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            <div className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    تصمیم و اقدام مدیر
                </h2>
            </div>

            <div className="mt-4">
                <label
                    htmlFor="admin-note"
                    className="mb-2 block text-sm font-bold text-[#263f38]"
                >
                    دلیل اقدام یا یادداشت مدیریتی
                </label>

                <textarea
                    id="admin-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    placeholder="دلیل روشن و قابل حسابرسی وارد کنید..."
                    className="w-full resize-none rounded-xl border border-[#d5dfda] bg-white px-4 py-4 text-sm text-[#263f38] outline-none transition placeholder:text-[#a4aea9] focus:border-[#17463c] focus:ring-2 focus:ring-[#17463c]/10"
                />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                    type="button"
                    className="rounded-xl border border-[#d8e1dd] bg-white px-5 py-3 text-xs font-bold text-[#52635c] transition hover:bg-[#f6f9f7]"
                >
                    تعلیق
                </button>

                <button
                    type="button"
                    className="rounded-xl border border-[#d4a447] bg-[#fffaf0] px-5 py-3 text-xs font-bold text-[#765820] transition hover:bg-[#fdf3dd]"
                >
                    نیازمند بررسی بیشتر
                </button>

                <button
                    type="button"
                    className="rounded-xl bg-[#17463c] px-5 py-3 text-xs font-bold text-white shadow-[0_6px_15px_rgba(23,70,60,0.18)] transition hover:bg-[#123b33]"
                >
                    ثبت اقدام
                </button>
            </div>
        </section>
    );
}
