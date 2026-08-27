'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import ReviewDisputeForm from '@/components/pages/dashboard/lawyer/(reviews)/(review-dispute)/ReviewDisputeForm';

export default function ReviewDisputePage({ reviewId }) {
    const [submittedRequest, setSubmittedRequest] = useState(null);

    if (submittedRequest) {
        return (
            <div className="mx-auto w-full max-w-[1500px]">
                <section className="grid min-h-96 place-items-center rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                    <div>
                        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <CheckCircle2 size={30} />
                        </div>

                        <h1 className="mt-5 text-2xl font-black text-[#123b34]">
                            درخواست ثبت شد
                        </h1>

                        <p className="mt-3 text-sm leading-7 text-[#657571]">
                            درخواست شما با شناسه {submittedRequest.id} برای
                            بررسی ثبت شد.
                        </p>

                        <Link
                            href="/lawyer/reviews"
                            className="mt-6 inline-flex rounded-xl bg-[#0b5648] px-6 py-3 text-sm font-bold text-white"
                        >
                            بازگشت به بازخوردها
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <header className="mb-8 pt-4">


                <h1 className="mt-5 text-3xl font-black leading-tight text-[#0b302b] sm:text-4xl">
                    پاسخ حرفه‌ای یا گزارش ایراد
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#75847f]">
                    پاسخ نباید اطلاعات محرمانه پرونده یا اتهام علیه موکل را
                    آشکار کند.
                </p>

                {reviewId && (
                    <p className="mt-2 text-xs text-[#97a29f]">
                        شناسه بازخورد: {reviewId}
                    </p>
                )}
            </header>

            <ReviewDisputeForm
                reviewId={reviewId}
                onSuccess={setSubmittedRequest}
            />
        </div>
    );
}
