import Link from 'next/link';

import NegotiationChat from './NegotiationChat';
import NegotiationFramework from './NegotiationFramework';
import { negotiationData } from './negotiationData';

export default function NegotiationPage() {
    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <header className="mb-8 pt-4">
                <div className="flex items-center gap-3">
                    <span className="h-px w-7 bg-[#c99f42]" />

                    <p className="text-sm font-bold text-[#a47b2c]">
                        مذاکره محدود
                    </p>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="text-3xl font-black leading-tight text-[#0b302b] sm:text-4xl">
                            گفت‌وگو درباره شرایط همکاری
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-[#75847f]">
                            این فضا فقط برای شفاف‌سازی محدوده، زمان و شرایط مالی
                            با وکیل انتخاب‌شده است.
                        </p>

                        <p className="mt-2 text-xs text-[#97a29f]">
                            پرونده {negotiationData.caseCode} · همکاری{' '}
                            {negotiationData.engagementCode}
                        </p>
                    </div>

                    <Link
                        href={`/lawyer/cases/${encodeURIComponent(
                            negotiationData.caseCode,
                        )}?tab=contract`}
                        className="inline-flex w-fit rounded-xl bg-[#0b5648] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073f35]"
                    >
                        ورود به قرارداد
                    </Link>
                </div>
            </header>

            <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.7fr]">
                <NegotiationChat
                    caseCode={negotiationData.caseCode}
                    initialMessages={negotiationData.initialMessages}
                />

                <NegotiationFramework items={negotiationData.frameworkItems} />
            </div>
        </div>
    );
}
