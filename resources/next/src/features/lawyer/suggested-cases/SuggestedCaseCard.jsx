import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';
import SuggestedCaseMeta from './SuggestedCaseMeta';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const SuggestedCaseCard = ({ caseItem }) => {
    return (
        <article
            dir="rtl"
            className={`${vazir.className} border-b border-[#edf0ee] py-7 last:border-b-0`}
        >
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                {/* اطلاعات پرونده */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 text-right sm:flex-row-reverse sm:items-center sm:justify-between">
                        <div>
                            <p className="mb-2 font-bold text-[#9b782f]">
                                مطالبه
                            </p>

                            <h2 className="font-extrabold text-[#173b34]">
                                {caseItem.title}
                            </h2>
                        </div>

                        <span className="w-fit rounded-full border border-[#f0cccc] bg-[#fff6f6] px-3 py-1.5 font-semibold text-[#c65c5c]">
                            فوریت زیاد
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 text-right sm:grid-cols-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[#9aa39f]">شهر</span>

                            <div className="flex items-center justify-start gap-1.5 font-medium text-[#304b44]">
                                <MapPin size={15} strokeWidth={1.8} />

                                <span>{caseItem.city}</span>
                            </div>
                        </div>

                        <SuggestedCaseMeta
                            label="حوزه حقوقی"
                            value={caseItem.category}
                        />

                        <SuggestedCaseMeta
                            label="بودجه"
                            value={caseItem.budget}
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap justify-start gap-2">
                        {caseItem.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-[#dfe7e2] bg-[#f8faf8] px-3 py-1.5 text-[#65716b]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* سمت چپ */}
                <div className="flex shrink-0 items-center justify-between gap-5 lg:flex-col lg:items-center">
                    <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-2xl bg-[#d3ae58] text-center text-[#173b34]">
                        <span className="font-black">{caseItem.match}٪</span>

                        <span>تناسب تخصصی</span>
                    </div>

                    <Link
                        href={`/lawyer/opportunity/${caseItem.id}`}
                        className="group flex items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 font-bold text-white shadow-[0_8px_20px_rgba(18,63,55,0.12)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1d5147] hover:shadow-lg"
                    >
                        <span>مشاهده خلاصه</span>

                        <ArrowLeft
                            size={17}
                            strokeWidth={1.8}
                            className="transition-transform duration-200 group-hover:-translate-x-1"
                        />
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default SuggestedCaseCard;
