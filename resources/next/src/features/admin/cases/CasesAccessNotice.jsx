export default function CasesAccessNotice() {
    return (
        <section className="mt-4 flex items-start gap-3 rounded-2xl border border-[#cfe5ee] bg-[#f3fbfe] px-5 py-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-[#39718a]">
                i
            </span>

            <div>
                <h2 className="text-sm font-black text-[#426f7c]">
                    دسترسی حداقلی
                </h2>

                <p className="mt-1 text-xs leading-6 text-[#7b8c91]">
                    صفحه جزئیات ابتدا اطلاعات عملیاتی را نمایش می‌دهد. ورود به
                    اسناد، پیام‌ها یا مشخصات حساس با ثبت دلیل انجام می‌شود.
                </p>
            </div>
        </section>
    );
}
