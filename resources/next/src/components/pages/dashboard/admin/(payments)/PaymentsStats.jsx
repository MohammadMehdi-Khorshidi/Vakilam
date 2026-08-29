import { BarChart3, CreditCard } from 'lucide-react';

import { paymentStats } from './paymentsData';

export default function PaymentsStats() {
    return (
        <section
            dir="rtl"
            className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            {paymentStats.map((stat) => {
                const isStopped = stat.type === 'stopped';

                return (
                    <div
                        key={stat.id}
                        className="relative overflow-hidden rounded-2xl border border-[#dce5e0] bg-white px-5 py-5 shadow-[0_8px_25px_rgba(15,52,45,0.035)]"
                    >
                        {/* Decorative circle */}
                        <div className="absolute -bottom-7 -right-7 h-16 w-16 rounded-full bg-[#fff8e9]" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium text-[#7f8c86]">
                                    {stat.title}
                                </p>

                                <p
                                    className={`mt-2 text-xl font-black ${
                                        isStopped
                                            ? 'text-[#173d35]'
                                            : 'text-[#173d35]'
                                    }`}
                                >
                                    {stat.value}
                                </p>
                            </div>

                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#dce8e3] bg-white text-[#173d35]">
                                {isStopped ? (
                                    <BarChart3 size={18} strokeWidth={1.8} />
                                ) : (
                                    <CreditCard size={18} strokeWidth={1.8} />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
