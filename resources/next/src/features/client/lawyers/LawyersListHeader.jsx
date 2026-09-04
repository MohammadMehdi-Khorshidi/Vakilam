import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const LawyersListHeader = () => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} mb-3 rounded-[16px] border border-[#dfe7e4] bg-white px-5 py-4`}
        >
            <div className="flex items-center justify-between gap-5">
                <div className="text-right">
                    <h2 className="font-extrabold text-[#173f38]">
                        فهرست همه وکلا
                    </h2>

                    <p className="mt-1 text-[#7a8884]">
                        مرتبط‌ترین وکلا براساس اطلاعات فعلی پرونده در ابتدای
                        فهرست قرار گرفته‌اند.
                    </p>
                </div>

                <button
                    type="button"
                    className="shrink-0 rounded-[11px] border border-[#dce5e1] bg-white px-4 py-2.5 font-bold text-[#52645f] transition hover:border-[#123f37] hover:text-[#123f37]"
                >
                    پیشنهادهایی که بعداً می‌رسند
                </button>
            </div>
        </section>
    );
};

export default LawyersListHeader;
