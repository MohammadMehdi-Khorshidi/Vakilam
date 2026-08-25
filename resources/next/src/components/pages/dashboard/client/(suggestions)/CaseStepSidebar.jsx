import { Check, ShieldCheck } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: 'شرح مسئله',
    },
    {
        id: 2,
        title: 'برداشت و دسته‌بندی',
    },
    {
        id: 3,
        title: 'گفت‌وگوی راهنما',
    },
    {
        id: 4,
        title: 'راهنمای اقدام',
    },
    {
        id: 5,
        title: 'شرح پرونده',
    },
    {
        id: 6,
        title: 'فوریت',
    },
    {
        id: 7,
        title: 'مدارک',
    },
    {
        id: 8,
        title: 'محرمانگی',
    },
    {
        id: 9,
        title: 'خلاصه و اصلاح',
    },
    {
        id: 10,
        title: 'تأیید نهایی',
    },
    {
        id: 11,
        title: 'انتخاب مسیر بعدی',
    },
];

const CaseStepSidebar = ({ currentStep }) => {
    return (
        <aside dir="rtl" className="rounded-[18px] border border-[#e0e8e4] bg-white p-4 shadow-[0_4px_18px_rgba(18,63,55,0.035)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#edf1ef] pb-4">
                <span className="text-[#77837f]">مسیر تشکیل پرونده</span>

                <span className="font-extrabold text-[#123f37]">
                    {currentStep} از {steps.length}
                </span>
            </div>

            {/* Steps */}
            <div className="mt-4">
                {steps.map((step, index) => {
                    const completed = step.id < currentStep;
                    const active = step.id === currentStep;

                    return (
                        <div
                            key={step.id}
                            className="relative flex items-center gap-3"
                        >
                            {/* connector */}
                            {index !== steps.length - 1 && (
                                <div
                                    className={`absolute right-[11px] top-[29px] h-[30px] w-px ${
                                        completed
                                            ? 'bg-[#2d8067]'
                                            : 'bg-[#e8edeb]'
                                    }`}
                                />
                            )}

                            {/* number / check */}
                            <div
                                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] transition-all duration-200 ${
                                    completed
                                        ? 'bg-[#287a63] text-white'
                                        : active
                                          ? 'bg-[#c9a64f] text-[#123f37]'
                                          : 'border border-[#e5eae8] bg-white text-[#aeb7b3]'
                                }`}
                            >
                                {completed ? (
                                    <Check size={14} strokeWidth={3} />
                                ) : (
                                    <span className="font-bold">{step.id}</span>
                                )}
                            </div>

                            {/* title */}
                            <div
                                className={`flex min-h-[46px] flex-1 items-center transition-all ${
                                    completed
                                        ? 'font-bold text-[#527168]'
                                        : active
                                          ? 'font-extrabold text-[#123f37]'
                                          : 'text-[#a5aeaa]'
                                }`}
                            >
                                {step.title}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* privacy */}
            <div className="mt-3 border-t border-[#edf1ef] pt-4">
                <div className="flex items-start gap-2">
                    <ShieldCheck
                        size={15}
                        className="mt-1 shrink-0 text-[#123f37]"
                    />

                    <p className="leading-6 text-[#899591]">
                        اطلاعات این مسیر محرمانه است و فقط برای همین پرونده
                        استفاده می‌شود.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default CaseStepSidebar;
