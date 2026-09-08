import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const LawyersHeader = () => {
    return (
        <section dir="rtl" className={`${vazirmatn.className} mb-6 mt-10`}>
            <div>
                <h1 className="text-right text-2xl font-bold tracking-tight text-[#123f37]">
                    همه وکلا؛ مرتبط‌ترین‌ها ابتدا
                </h1>

                <p className="mt-3 max-w-3xl text-right leading-7 text-[#71817c]">
                    در این صفحه همه وکلای نمایش سامانه را می‌بینید. ترتیب
                    اولیه براساس تناسب با موضوع پرونده، شهر، تخصص، احراز و
                    تجربه همکاری است. پیشنهادهای مالی بعداً و در بخش جداگانه
                    نمایش داده می‌شوند.
                </p>
            </div>
        </section>
    );
};

export default LawyersHeader;
