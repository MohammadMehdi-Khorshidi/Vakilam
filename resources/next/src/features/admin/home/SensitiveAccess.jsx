import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { sensitiveAccessItems } from './dashboardData';
import PanelTitle from './PanelTitle';

export default function SensitiveAccess() {
    return (
        <article className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_6px_18px_rgba(15,52,45,0.03)] md:p-6">
            <PanelTitle title="دسترسی‌های حساس" description="کنترل و حسابرسی" />

            <div className="mt-4 space-y-3">
                {sensitiveAccessItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="group flex items-center gap-3 rounded-xl border border-[#e0e7e3] p-4 transition hover:border-[#c9a34f]/40 hover:bg-[#f7faf8]"
                        >
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f5f2]">
                                <Icon size={19} strokeWidth={1.8} />
                            </span>

                            <div className="min-w-0 flex-1">
                                <strong className="block truncate text-sm text-[#173b34]">
                                    {item.title}
                                </strong>

                                <p className="mt-1 text-xs text-[#87938d]">
                                    {item.description}
                                </p>
                            </div>

                            <ArrowLeft
                                size={17}
                                className="shrink-0 transition-transform group-hover:-translate-x-1"
                            />
                        </Link>
                    );
                })}
            </div>
        </article>
    );
}
