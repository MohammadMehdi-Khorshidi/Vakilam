function InfoIcon() {
    return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-bold text-[#28728d]">
            i
        </span>
    );
}

export default function AiErrorsNotice() {
    return (
        <aside className="flex items-start gap-3 rounded-2xl border border-[#cae3ed] bg-[#effaff] px-5 py-4">
            <InfoIcon />

            <div>
                <h2 className="text-sm font-black text-[#263e39]">
                    مرز تصمیم‌گیری
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#74837e]">
                    هوش مصنوعی نباید نتیجه حقوقی، مالی یا قراردادی را بدون تأیید
                    کاربر مجاز نهایی کند.
                </p>
            </div>
        </aside>
    );
}
