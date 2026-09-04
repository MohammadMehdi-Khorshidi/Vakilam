export default function NotificationsHeader() {
    return (
        <header className="mb-8">
            <div className="mb-4 flex items-center gap-3 text-sm font-bold text-[#a8791e]">
                <span>مدیریت وضعیت‌ها و اعلان‌ها</span>

                <span aria-hidden="true" className="h-px w-8 bg-[#c89328]" />
            </div>

            <h1 className="text-[27px] font-black leading-[1.5] tracking-[-0.04em] text-[#103a33] sm:text-3xl lg:text-[37px]">
                اعلان‌های مهم سامانه
            </h1>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-[#76837f]">
                هر اعلان به صفحه کامل متن، مخاطب، محرک، کانال و وضعیت انتشار
                متصل است.
            </p>
        </header>
    );
}
