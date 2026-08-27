import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const SuggestedCasesHeader = () => {
    return (
        <section dir="rtl" className={`${vazir.className} mb-6 text-right`}>
            <h1 className="font-black text-[#123f37]">
                فرصت‌های متناسب با تخصص شما
            </h1>

            <p className="mt-3 leading-7 text-[#7c8581]">
                در این بخش فقط اطلاعات لازم و حداقلی برای بررسی اولیه پرونده
                نمایش داده می‌شود و ارتباط مستقیم موکل پنهان است.
            </p>
        </section>
    );
};

export default SuggestedCasesHeader;
