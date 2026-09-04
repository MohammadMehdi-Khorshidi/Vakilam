import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const LawyersHeader = () => {
    return (
        <section dir="rtl" className={`${vazirmatn.className} mb-6 mt-10`}>
            <div className="flex items-end justify-between gap-6">
                <div className="min-w-0">


                    <h1 className="text-right text-2xl font-bold tracking-tight text-[#123f37]">
                        همه وکلا؛ مرتبط‌ترین‌ها ابتدا
                    </h1>

                    <p className="mt-3 max-w-3xl text-right leading-7 text-[#71817c]">
                        در این صفحه همه وکلای نمایش سامانه را می‌بینید. ترتیب
                        اولیه براساس تناسب با موضوع پرونده، شهر، تخصص، احراز و
                        تجربه همکاری است.
                        پیشنهادهای مالی بعداً و در بخش جداگانه نمایش داده
                        می‌شوند.
                    </p>
                </div>

                <button
                    type="button"
                    className="shrink-0 rounded-[12px] border border-[#d8bb82] bg-white px-5 py-3 font-bold text-[#294e46] transition hover:bg-[#fffaf0]"
                >
                    مشاهده پیشنهادهای دریافتی
                </button>
            </div>
        </section>
    );
};

export default LawyersHeader;
