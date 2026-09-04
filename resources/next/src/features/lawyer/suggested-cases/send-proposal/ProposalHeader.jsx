import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ProposalHeader = () => {
    return (
        <section dir="rtl" className={`${vazir.className} mb-7 text-right`}>
            <h1 className="font-black text-[#123f37]">
                شرایط پیشنهاد خود را ثبت کنید
            </h1>

            <p className="mt-3 leading-7 text-[#7c8581]">
                پیشنهاد باید روشن، قابل مقایسه و بدون ادعای تضمین نتیجه باشد.
            </p>
        </section>
    );
};

export default ProposalHeader;
