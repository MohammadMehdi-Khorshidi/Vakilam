import CaseRow from './CaseRow';

export default function CasesTable({ cases }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-[0_8px_25px_rgba(15,52,45,0.04)]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse">
                    <thead>
                        <tr className="border-b border-[#e1e7e3] bg-[#fbfcfb]">
                            <th className="px-5 py-4 text-right text-xs font-bold text-[#73817b]">
                                شناسه
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-bold text-[#73817b]">
                                عنوان
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-bold text-[#73817b]">
                                موکل
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-bold text-[#73817b]">
                                وضعیت
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-bold text-[#73817b]">
                                وکیل
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-bold text-[#73817b]">
                                اقدام
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {cases.map((item) => (
                            <CaseRow key={item.id} caseItem={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
