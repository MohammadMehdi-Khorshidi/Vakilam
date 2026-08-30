import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const VisibilityLimitations = () => {
    return (
        <section
            className={`${vazir.className} rounded-[20px] border border-[#e1e8e4] bg-white p-5 shadow-[0_4px_20px_rgba(18,63,55,0.04)] sm:p-7`}
        >
            <div className="border-b border-[#edf0ee] pb-5">
                <h2 className="font-extrabold text-[#173b34]">
                    محدودیت مشاهده
                </h2>
            </div>

            <ul className="space-y-3 pt-5 text-right text-[#596762]">
                <li>• اطلاعات تماس و نشانی طرفین نمایش داده نمی‌شود.</li>

                <li>
                    • اسناد کامل بعد از شکل‌گیری رابطه همکاری و براساس سطح
                    دسترسی ارائه می‌شود.
                </li>

                <li>• دانلود یا استفاده خارج از پرونده مجاز نیست.</li>
            </ul>
        </section>
    );
};

export default VisibilityLimitations;
