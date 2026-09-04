const steps = [
    {
        title: 'پیش‌پرداخت موکل',
        description: 'ثبت‌شده در وکیلم',
    },
    {
        title: 'ثبت قرارداد در عدل ایران',
        description: 'تکمیل شده',
    },
    {
        title: 'بارگذاری قرارداد',
        description: 'انجام شده',
    },
    {
        title: 'تأیید موکل',
        description: 'در انتظار',
    },
    {
        title: 'آزادسازی سهم وکیل',
        description: 'پس از تأیید موکل',
    },
];

export default function CooperationStatus() {
    return (
        <article
            dir="rtl"
            className="rounded-[20px] border border-[#dfe5e1] bg-white p-5 shadow-[0_8px_25px_rgba(16,47,41,0.04)] sm:p-6"
        >
            <h2 className="text-lg font-black">وضعیت همکاری جاری</h2>

            <ol className="relative mt-7">
                <div className="absolute right-[15px] top-4 h-[calc(100%-32px)] w-px bg-[#dce2df]" />

                {steps.map((step, index) => (
                    <li
                        key={step.title}
                        className="relative flex min-h-[72px] items-start gap-4"
                    >
                        <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d3ad58] text-sm font-black text-[#17342e]">
                            {index + 1}
                        </span>

                        <div className="pt-1 text-right">
                            <strong className="text-sm">{step.title}</strong>
                            <p className="mt-1 text-xs text-[#89918e]">
                                {step.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </article>
    );
}
