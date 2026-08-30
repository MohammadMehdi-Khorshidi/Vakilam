import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ActionsHeader = () => {
    return (
        <section dir="rtl" className={`${vazir.className} mb-7 mt-10 text-right`}>


            <h1 className="font-black text-2xl text-[#123f37]">اقدام‌های مهم وکیل</h1>

            <p className="mt-3 leading-7 text-[#7c8581]">
                کارهای وابسته به زمان و فرایند همکاری در اولویت نمایش داده
                می‌شوند.
            </p>
        </section>
    );
};

export default ActionsHeader;
