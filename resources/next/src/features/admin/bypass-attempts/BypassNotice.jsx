function InfoIcon() {
    return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-bold text-[#28728d]">
            i
        </span>
    );
}

export default function BypassNotice() {
    return (
        <aside className="flex items-start gap-3 rounded-2xl border border-[#cae3ed] bg-[#effaff] px-5 py-4">
            <InfoIcon />

            <div>
                <h2 className="text-sm font-black text-[#263e39]">
                    آزمایش زنده نمونه
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#74837e]">
                    در صفحه مذاکره می‌توانید شماره یا لینک وارد کنید تا رویداد
                    نمایشی ثبت شود.
                </p>
            </div>
        </aside>
    );
}
