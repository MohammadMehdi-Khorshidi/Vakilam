import { Check, CreditCard } from 'lucide-react';

export default function ContractFinancialStatus({ contract }) {
    const financialItems = contract?.financialItems ?? [];

    return (
        <section className="mt-5 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] sm:p-6">
            <div className="border-b border-[#e5ebe7] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    وضعیت کامل قرارداد و شرایط مالی
                </h2>
            </div>

            <div className="mt-5 space-y-2">
                {financialItems.length > 0 ? (
                    financialItems.map((item, index) => {
                        const isFinancial = item.status === 'financial';

                        return (
                            <div
                                key={item.id ?? index}
                                className="flex min-h-[54px] items-center justify-between gap-4 rounded-xl bg-[#f3f8f5] px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#17463c]">
                                        {isFinancial ? (
                                            <CreditCard
                                                size={16}
                                                strokeWidth={1.8}
                                            />
                                        ) : (
                                            <Check size={16} strokeWidth={2} />
                                        )}
                                    </span>

                                    <span className="text-sm font-bold text-[#24463e]">
                                        {item.title}
                                    </span>
                                </div>

                                <span className="text-xs font-bold text-[#70807a]">
                                    {item.value}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-xl bg-[#f3f8f5] px-4 py-5 text-center text-sm text-[#87938d]">
                        اطلاعات وضعیت مالی ثبت نشده است.
                    </div>
                )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    className="rounded-xl border border-[#dce4df] bg-white px-5 py-3 text-xs font-bold text-[#31544b] transition hover:bg-[#f5f8f6]"
                >
                    مشاهده جزئیات مالی
                </button>

                <button
                    type="button"
                    className="rounded-xl border border-[#d8b56d] bg-[#fffaf0] px-5 py-3 text-xs font-bold text-[#76561d] transition hover:bg-[#fdf3df]"
                >
                    پیش‌نمایش این قرارداد
                </button>
            </div>
        </section>
    );
}
