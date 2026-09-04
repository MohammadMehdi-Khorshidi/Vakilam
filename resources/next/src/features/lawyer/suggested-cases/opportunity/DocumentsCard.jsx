import { FileText } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const documents = [
    {
        id: 1,
        title: 'تصویر چک',
        description: 'پیش‌نمایش محدود و پوشانده‌شده',
    },
    {
        id: 2,
        title: 'گواهی عدم پرداخت',
        description: 'پیش‌نمایش محدود',
    },
];

const DocumentsCard = () => {
    return (
        <section
            className={`${vazir.className} rounded-[20px] border border-[#e1e8e4] bg-white p-5 shadow-[0_4px_20px_rgba(18,63,55,0.04)] sm:p-7`}
        >
            <div className="border-b border-[#edf0ee] pb-5">
                <h2 className="font-extrabold text-[#173b34]">مدارک موجود</h2>
            </div>

            <div className="space-y-2 pt-5">
                {documents.map((document) => (
                    <div
                        key={document.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-[#e1e8e4] px-4 py-3"
                    >
                        <span className="rounded-full border border-[#cce3ed] bg-[#f3f9fb] px-3 py-1 text-[#4d7886]">
                            موجود
                        </span>

                        <div className="flex items-center gap-3 text-right">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1f1] text-[#c85c5c]">
                                <FileText size={17} />
                            </div>

                            <div>
                                <h3 className="font-bold text-[#263f39]">
                                    {document.title}
                                </h3>

                                <p className="mt-1 text-[#89948f]">
                                    {document.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DocumentsCard;
