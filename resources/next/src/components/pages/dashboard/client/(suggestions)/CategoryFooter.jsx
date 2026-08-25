const CategoryFooter = ({
    currentStep,
    selectedCategory,
    onContinue,
    onBack,
}) => {
    const isLastStep = currentStep === 11;

    return (
        <div dir="rtl" className="mt-4">
            <div className="flex flex-col gap-3 rounded-[14px] border border-[#e0e8e4] bg-[#fbfcfb] p-3 md:flex-row md:items-center md:justify-between">
                <div className="text-right">
                    <h3 className="font-extrabold text-[#294e46]">
                        پیشنهاد شما ذخیره شد.
                    </h3>

                    <p className="mt-1 text-[#899591]">
                        دسته انتخاب‌شده: {selectedCategory}
                    </p>
                </div>

                <button
                    type="button"
                    className="rounded-[10px] border border-[#d6e0dc] bg-white px-4 py-2 font-bold text-[#294e46] transition hover:border-[#123f37]"
                >
                    ذخیره و خروج
                </button>
            </div>

            <div className="my-4 h-px bg-[#e7ecea]" />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={currentStep <= 1}
                    className="rounded-[11px] border border-[#d6e0dc] bg-white px-5 py-3 font-bold text-[#42685e] transition hover:border-[#123f37] hover:text-[#123f37] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    بازگشت
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        className="rounded-[11px] border border-[#d6e0dc] bg-white px-5 py-3 font-bold text-[#294e46] transition hover:border-[#123f37]"
                    >
                        پرسش‌های تکمیلی و راهنمای اولیه
                    </button>

                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={isLastStep}
                        className="rounded-[11px] bg-[#123f37] px-7 py-3 font-extrabold text-white shadow-[0_7px_18px_rgba(18,63,55,0.16)] transition-all hover:bg-[#0d302a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ادامه به اطلاعات پایه
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryFooter;
