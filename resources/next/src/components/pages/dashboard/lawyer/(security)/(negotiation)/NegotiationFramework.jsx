import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function NegotiationFramework({ items }) {
    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="border-b border-[#edf1ef] pb-5">
                <h2 className="text-xl font-bold text-[#123b34]">
                    چارچوب مذاکره
                </h2>
            </header>

            <ul className="mt-5 space-y-3">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                        <CheckCircle2
                            size={18}
                            className="mt-1 shrink-0 text-[#0b5648]"
                        />

                        <span className="text-sm leading-7 text-[#52635e]">
                            {item}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-amber-700">
                    <AlertTriangle size={19} />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-[#183d36]">ممنوع</h3>

                    <p className="mt-2 text-xs leading-6 text-[#7f6a3b]">
                        پیشنهاد قرارداد، پرداخت یا ادامه همکاری خارج از وکیلم
                        ثبت و برای مدیر قابل بررسی است.
                    </p>
                </div>
            </div>
        </section>
    );
}
