import { Info } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const SmartSummary = () => {
    return (
        <section
            className={`${vazir.className} rounded-[20px] border border-[#e1e8e4] bg-white p-5 shadow-[0_4px_20px_rgba(18,63,55,0.04)] sm:p-7`}
        >
            <div className="border-b border-[#edf0ee] pb-5">
                <h2 className="font-extrabold text-[#173b34]">خلاصه هوشمند</h2>
            </div>

            <div className="py-6 text-right">
                <p className="leading-8 text-[#596762]">
                    موکل یک فقره چک به مبلغ ۸۲ میلیون تومان در اختیار دارد که در
                    سررسید پرداخت نشده است. گواهی عدم پرداخت دریافت شده و موکل
                    قصد مطالبه وجه و خسارت تأخیر را دارد.
                </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[#cfe1e7] bg-[#f2f9fb] p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#54747d]">
                    <Info size={16} />
                </div>

                <div className="text-right">
                    <h3 className="font-bold text-[#36545d]">
                        خروجی هوش مصنوعی
                    </h3>

                    <p className="mt-2 leading-6 text-[#718187]">
                        این خلاصه توسط موکل بررسی شده است اما جایگزین مطالعه
                        اسناد پس از شروع همکاری نیست.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default SmartSummary;
