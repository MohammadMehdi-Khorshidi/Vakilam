import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const MeetingsHeader = () => {
    return (
        <section className={`${vazirmatn.className} mb-7`}>


            <h1 className="text-right font-extrabold tracking-tight text-[#123f37]">
                جلسات و قرارهای همکاری
            </h1>

            <p className="mt-3 text-right leading-7 text-[#71817c]">
                جلسات مرتبط با پرونده، دستور جلسه و خلاصه تأییدشده در این بخش
                نگهداری می‌شوند.
            </p>
        </section>
    );
};

export default MeetingsHeader;
