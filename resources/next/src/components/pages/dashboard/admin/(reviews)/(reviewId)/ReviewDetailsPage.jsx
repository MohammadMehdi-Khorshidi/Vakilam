import Link from 'next/link';

import ReviewDecisionForm from './ReviewDecisionForm';

export default function ReviewDetailsPage({ review }) {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <header className="mb-8">
                    <div className="mb-6 flex items-center gap-2 text-sm">
                        <Link
                            href="/admin/reviews"
                            className="text-[#76837f] transition hover:text-[#174a40]"
                        >
                            بازخوردها
                        </Link>

                        <span className="text-[#aeb7b4]">/</span>

                        <span className="font-bold text-[#263c37]">
                            {review.id}
                        </span>
                    </div>

                    <div className="mb-4 flex items-center gap-3 text-sm font-bold text-[#a8791e]">
                        <span>بررسی بازخورد</span>
                        <span className="h-px w-8 bg-[#c89328]" />
                    </div>

                    <h1 className="text-3xl font-black leading-[1.5] tracking-[-0.04em] text-[#103a33] sm:text-[38px]">
                        بازخورد درباره {review.author}
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#74817d]">
                        {review.description}
                    </p>
                </header>

                <div className="grid gap-5 lg:grid-cols-2">
                    <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                        <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                            متن ثبت‌شده
                        </h2>

                        <p className="mt-5 text-sm leading-8 text-[#263f39]">
                            {review.text}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                                امتیاز {review.rating}
                            </span>

                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                {review.collaborationStatus}
                            </span>

                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                {review.visibilityStatus}
                            </span>
                        </div>
                    </section>

                    <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                        <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                            کنترل‌های مدیر
                        </h2>

                        <ul className="mt-5 space-y-4">
                            {review.controls.map((control) => (
                                <li
                                    key={control.id}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <span
                                        className={`flex size-4 items-center justify-center rounded-sm border ${
                                            control.checked
                                                ? 'border-[#1f6256] bg-[#1f6256] text-white'
                                                : 'border-[#8d9894] bg-white'
                                        }`}
                                    >
                                        {control.checked ? '✓' : ''}
                                    </span>

                                    <span>{control.label}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="mt-5">
                    <ReviewDecisionForm review={review} />
                </div>
            </div>
        </main>
    );
}
