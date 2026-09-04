import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const CaseTimeline = ({ items = [] }) => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfe7e4] bg-white p-5 shadow-[0_4px_18px_rgba(18,63,55,0.035)]`}
        >
            <h2 className="font-extrabold text-[#173f38]">خط زمانی پرونده</h2>

            <div className="mt-5">
                {items.map((item, index) => {
                    const last = index === items.length - 1;

                    return (
                        <div
                            key={item.id ?? index}
                            className="relative flex gap-4 pb-6"
                        >
                            {!last && (
                                <div className="absolute right-[13px] top-7 h-full w-px bg-[#e4e9e7]" />
                            )}

                            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c9a96e] font-bold text-[#173f38]">
                                {index + 1}
                            </div>

                            <div className="flex-1 text-right">
                                <h3 className="font-bold text-[#173f38]">
                                    {item.title}
                                </h3>

                                <p className="mt-1 text-xs text-[#8a9692]">
                                    {item.date}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default CaseTimeline;
