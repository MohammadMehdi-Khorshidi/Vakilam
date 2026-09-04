import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const DocumentsHeader = () => {
    return (
        <section className={`${vazirmatn.className} mt-15`}>


            <h1 className="text-right font-extrabold tracking-tight text-[#123f37] md:text-[32px]">
                مدارک و فایل‌های محرمانه
            </h1>

            <p className="mt-3 text-right leading-7 text-[#71817c]">
                هر سند با نوع، وضعیت بررسی، سطح دسترسی و تاریخچه اصلاح اطلاعات
                نگهداری می‌شود.
            </p>
        </section>
    );
};

export default DocumentsHeader;
