'use client';

import { useState } from 'react';

export default function BypassDecision({ eventId }) {
    const [note, setNote] = useState('');

    function handleAction(action) {
        console.log({
            eventId,
            action,
            note,
        });
    }

    return (
        <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
            <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                تصمیم و اقدام مدیر
            </h2>

            <label
                htmlFor="bypass-manager-note"
                className="mt-4 block text-sm font-bold"
            >
                دلیل اقدام یا یادداشت مدیریتی
            </label>

            <textarea
                id="bypass-manager-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="دلیل روشن و قابل حسابرسی وارد کنید..."
                className="mt-3 min-h-32 w-full resize-y rounded-xl border border-[#d5dedb] bg-white p-4 text-sm outline-none transition placeholder:text-[#929d99] focus:border-[#b78b35] focus:ring-2 focus:ring-[#c89a3b]/15"
            />

            <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={() => handleAction('restrict-access')}
                    className="rounded-xl bg-[#b6414b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a13640]"
                >
                    محدودسازی دسترسی
                </button>

                <button
                    type="button"
                    onClick={() => handleAction('save-note')}
                    className="rounded-xl border border-[#d5dedb] bg-white px-5 py-3 text-sm font-bold transition hover:bg-[#f7f9f6]"
                >
                    ذخیره یادداشت
                </button>

                <button
                    type="button"
                    onClick={() => handleAction('refer-review')}
                    className="rounded-xl border border-[#d5a746] bg-[#fffcf5] px-5 py-3 text-sm font-bold transition hover:bg-[#fff7e6]"
                >
                    ارجاع برای بررسی
                </button>

                <button
                    type="button"
                    onClick={() => handleAction('submit-decision')}
                    className="rounded-xl bg-[#124b40] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0c3c34]"
                >
                    ثبت تصمیم
                </button>
            </div>
        </section>
    );
}
