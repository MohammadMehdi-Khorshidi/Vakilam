export default function SecurityHeader() {
    return (
        <header className="mb-8">
            <div className="mb-4 flex items-center gap-3 text-sm font-bold text-[#a8791e]">
                <span>رویدادهای امنیتی</span>

                <span aria-hidden="true" className="h-px w-8 bg-[#c89328]" />
            </div>

            <h1 className="text-[27px] font-black leading-[1.5] tracking-[-0.04em] text-[#103a33] sm:text-3xl lg:text-[37px]">
                ثبت و بررسی دسترسی‌ها
            </h1>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-[#76837f]">
                روی هر رویداد بزنید تا عامل، منبع، دامنه اثر، شواهد و اقدامات
                بعدی را کامل ببینید.
            </p>
        </header>
    );
}
