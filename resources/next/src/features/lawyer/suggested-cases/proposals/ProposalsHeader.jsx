import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ProposalsHeader = () => {
    return (
        <section dir="rtl" className={`${vazir.className} mb-7 text-right`}>

            <h1 className="font-black text-[#123f37]">
                پیگیری وضعیت پیشنهادها
            </h1>

            <p className="mt-3 leading-7 text-[#7c8581]">
                هر پیشنهاد تا انتخاب وکیل، مذاکره و ورود به قرارداد وضعیت
                جداگانه دارد.
            </p>
        </section>
    );
};

export default ProposalsHeader;
