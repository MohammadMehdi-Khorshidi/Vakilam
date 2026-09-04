import { Sparkles, CheckCircle2 } from 'lucide-react';

const CategorySuggestion = () => {
    return (
        <div
            dir="rtl"
            className="mb-4 rounded-[15px] border border-[#ead29a] bg-[#fffdf8] p-4"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#c9a96e] text-[#123f37]">
                        <Sparkles size={18} />
                    </div>

                    <div>
                        <p className="text-[#899591]">پیشنهاد دستیار هوشمند</p>

                        <h2 className="mt-1 font-extrabold text-[#123f37]">
                            حقوق و مالی
                        </h2>

                        <p className="mt-1 leading-6 text-[#657570]">
                            در شرح شما به چک، سررسید، گواهی عدم پرداخت و مطالبه
                            وجه اشاره شده است.
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full border border-[#ead9ac] bg-[#fff9e9] px-3 py-1 font-bold text-[#b28627]">
                    نیازمند تأیید شما
                </span>
            </div>
        </div>
    );
};

export default CategorySuggestion;
