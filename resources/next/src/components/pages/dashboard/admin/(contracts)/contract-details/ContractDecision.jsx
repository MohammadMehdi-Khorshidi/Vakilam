'use client';

import { useState } from 'react';

export default function ContractDecision() {
    const [note, setNote] = useState('');

    const handleSave = () => {
        console.log('Manager decision:', note);
    };

    return (
        <section className="mt-5 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] sm:p-6">
            <div className="border-b border-[#e5ebe7] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    تصمیم و اقدام مدیر
                </h2>
            </div>

            <div className="mt-5">
                <label
                    htmlFor="manager-note"
                    className="mb-3 block text-sm font-bold text-[#263f38]"
                >
                    دلیل اقدام یا یادداشت مدیریتی
                </label>

                <textarea
                    id="manager-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    placeholder="دلیل روشن و قابل حسابرسی وارد کنید..."
                    className="w-full resize-none rounded-xl border border-[#dce4df] bg-white px-4 py-4 text-sm text-[#173d35] outline-none transition placeholder:text-[#9aa59f] focus:border-[#8eb3a7] focus:ring-2 focus:ring-[#dfeee8]"
                />
            </div>

            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    className="rounded-xl border border-[#dce4df] bg-white px-5 py-3 text-xs font-bold text-[#31544b] transition hover:bg-[#f5f8f6]"
                >
                    ذخیره یادداشت
                </button>

                <button
                    type="button"
                    className="rounded-xl border border-[#d8b56d] bg-[#fffaf0] px-5 py-3 text-xs font-bold text-[#76561d] transition hover:bg-[#fdf3df]"
                >
                    ارجاع برای بررسی
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-xl bg-[#124b40] px-6 py-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(18,75,64,0.15)] transition hover:bg-[#0e4036]"
                >
                    ثبت تصمیم
                </button>
            </div>
        </section>
    );
}
