export default function FeedbackCard() {
    return (
        <article
            dir="rtl"
            className="min-h-[330px] rounded-[20px] border border-[#dfe5e1] bg-white p-6 text-right shadow-[0_8px_25px_rgba(16,47,41,0.04)]"
        >
            <h2 className="text-lg font-black">بازخورد تجربه همکاری</h2>

            <div className="mt-8 flex items-end gap-2">
                <strong className="text-5xl font-black text-[#123e35]">
                    ۴٫۸
                </strong>
                <span className="pb-1 text-sm text-[#7f8984]">از ۵</span>
            </div>

            <p className="mt-2 text-sm text-[#7f8984]">۳۶ بازخورد بررسی‌شده</p>

            <p className="mt-4 max-w-[520px] text-sm leading-7 text-[#727c77]">
                این امتیاز درباره کیفیت همکاری است و نتیجه پرونده را نشان
                نمی‌دهد.
            </p>

            <button
                type="button"
                className="mt-5 text-sm font-bold text-[#176052] transition hover:text-[#0b4037]"
            >
                مشاهده جزئیات بازخورد
            </button>
        </article>
    );
}
