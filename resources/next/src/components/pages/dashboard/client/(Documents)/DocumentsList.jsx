import { Vazirmatn } from 'next/font/google';

import DocumentCard from '@/components/carts/DocumentCard';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const documents = [
    {
        id: 1,
        title: 'قرارداد-ثبت‌شده.pdf',
        type: 'pdf',
        category: 'قرارداد همکاری',
        status: 'نهایی',
    },
    {
        id: 2,
        title: 'تصویر چک.pdf',
        type: 'pdf',
        category: 'سند مالی',
        status: 'بررسی‌شده',
    },
    {
        id: 3,
        title: 'گواهی عدم پرداخت.jpg',
        type: 'jpg',
        category: 'مدرک بانکی',
        status: 'تأییدشده',
    },
    {
        id: 4,
        title: 'قرارداد الحاقی.pdf',
        type: 'pdf',
        category: 'قرارداد تجاری',
        status: 'نیازمند بررسی',
    },
];

const DocumentsList = () => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} rounded-[19px] border border-[#dfe7e3] bg-white p-4 shadow-[0_5px_20px_rgba(18,63,55,0.035)]`}
        >
            {/* عنوان بخش */}
            <div className="mb-4 flex items-center justify-between">
                <div className="text-right">
                    <h2 className=" font-extrabold text-[#123f37]">
                        فایل‌های پرونده
                    </h2>

                    <p className="mt-1  text-[#899691]">
                        اسناد ثبت‌شده در این پرونده
                    </p>
                </div>

                <span className="rounded-full bg-[#eef4f1] px-3 py-1 font-bold text-[#477066]">
                    {documents.length} سند
                </span>
            </div>

            {/* لیست اسناد */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {documents.map((document) => (
                    <DocumentCard
                        key={document.id}
                        title={document.title}
                        type={document.type}
                        category={document.category}
                        status={document.status}
                    />
                ))}
            </div>
        </section>
    );
};

export default DocumentsList;
