export default function ViolationEvidence({ violation }) {
    return (
        <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
            <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black text-[#173e38]">
                شواهد و تاریخچه بررسی
            </h2>

            <div className="mt-4 rounded-2xl border-r-4 border-[#bd4550] bg-[#fff1f2] p-5">
                <h3 className="font-bold text-[#be424d]">شاهد ثبت‌شده</h3>

                <p className="mt-3 text-sm leading-7 text-[#3f4e4a]">
                    {violation.evidence}
                </p>
            </div>

            <ol className="mt-4 space-y-4">
                {violation.history.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f1e2] text-sm font-bold">
                            {item.id}
                        </span>

                        <div>
                            <h3 className="text-sm font-bold">{item.title}</h3>

                            <p className="mt-1 text-xs text-[#89948f]">
                                {item.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
