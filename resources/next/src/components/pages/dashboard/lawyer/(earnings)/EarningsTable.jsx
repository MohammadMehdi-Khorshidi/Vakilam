import EarningRow from '@/components/pages/dashboard/lawyer/(earnings)/EarningRow';

export default function EarningsTable({ earnings }) {
    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-right">
                    <thead>
                        <tr className="border-b border-[#e3eae7] bg-[#fafcfb]">
                            <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                پرونده
                            </th>

                            <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                رابطه همکاری
                            </th>

                            <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                پیش‌پرداخت
                            </th>

                            <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                وضعیت سهم
                            </th>

                            <th className="px-4 py-4 text-xs font-bold text-[#75847f]">
                                اقدام
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {earnings.map((earning) => (
                            <EarningRow key={earning.id} earning={earning} />
                        ))}
                    </tbody>
                </table>
            </div>

            {!earnings.length && (
                <p className="py-14 text-center text-sm text-[#879590]">
                    هنوز اطلاعات مالی برای نمایش وجود ندارد.
                </p>
            )}
        </section>
    );
}
