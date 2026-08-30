export default function HealthChart({ value = 91, title = 'سلامت عملیاتی' }) {
    const safeValue = Math.min(Math.max(value, 0), 100);
    const degree = safeValue * 3.6;

    const chartBackground = {
        background: `conic-gradient(
            #d2ad5a 0deg,
            #d2ad5a ${degree}deg,
            rgba(255,255,255,0.14) ${degree}deg,
            rgba(255,255,255,0.14) 360deg
        )`,
    };

    return (
        <div className="mx-auto text-center">
            <div
                role="progressbar"
                aria-valuenow={safeValue}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={title}
                style={chartBackground}
                className="grid h-44 w-44 place-items-center rounded-full p-4"
            >
                <div className="grid h-full w-full place-items-center rounded-full bg-[#243f35] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                    <div>
                        <strong className="text-3xl font-black text-[#e4c778]">
                            {safeValue.toLocaleString('fa-IR')}٪
                        </strong>

                        <span className="mt-2 block text-sm text-white/65">
                            {title}
                        </span>
                    </div>
                </div>
            </div>

            <p className="mx-auto mt-5 max-w-[230px] text-xs leading-6 text-white/55">
                این شاخص برای مدیریت فرایند است و نتیجه حقوقی را پیش‌بینی
                نمی‌کند.
            </p>
        </div>
    );
}
