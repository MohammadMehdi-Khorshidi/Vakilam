'use client';

import { RotateCcw } from 'lucide-react';

const progressSteps = [
    { id: 1, title: 'شرح مسئله' },
    { id: 2, title: 'دسته‌بندی' },
    { id: 3, title: 'اطلاعات پایه' },
    { id: 4, title: 'مدارک اختیاری' },
    { id: 5, title: 'تأیید و انتخاب وکیل' },
];

const IntakeProgress = ({ step, setStep, onReset }) => {
    const currentStep = step + 1;

    return (
        <section
            dir="rtl"
            className="rounded-[18px] border border-[#e0e8e4] bg-white p-4 shadow-[0_4px_18px_rgba(18,63,55,0.035)]"
        >
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <span className="font-bold text-[#52655f]">
                        مسیر کوتاه تشکیل پرونده
                    </span>

                    <p className="mt-1 text-[#899591]">
                        اطلاعات هر مرحله را می‌توانید قبل از ثبت نهایی اصلاح کنید.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                >
                    <RotateCcw size={16} />
                    شروع دوباره
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {progressSteps.map((item) => {
                    const completed = item.id < currentStep;
                    const active = item.id === currentStep;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                if (item.id <= currentStep) {
                                    setStep(item.id - 1);
                                }
                            }}
                            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-[11px] border px-3 transition-all ${
                                completed
                                    ? 'border-[#cce5dc] bg-[#f1faf6] text-[#287a63]'
                                    : active
                                      ? 'border-[#7eafa1] bg-[#eff8f5] text-[#123f37]'
                                      : 'border-[#e3e9e6] bg-white text-[#7f8b87]'
                            }`}
                        >
                            <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                    completed
                                        ? 'bg-[#287a63] text-white'
                                        : active
                                          ? 'bg-[#123f37] text-white'
                                          : 'bg-[#eef3f1] text-[#788580]'
                                }`}
                            >
                                {completed ? '✓' : item.id}
                            </span>

                            <span className="font-bold">{item.title}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default IntakeProgress;
