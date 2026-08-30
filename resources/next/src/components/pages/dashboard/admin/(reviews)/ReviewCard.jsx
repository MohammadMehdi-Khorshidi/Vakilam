import Link from 'next/link';

const sensitivityConfig = {
    low: {
        label: 'حساسیت کم',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    medium: {
        label: 'حساسیت متوسط',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    high: {
        label: 'حساسیت زیاد',
        className: 'border-red-200 bg-red-50 text-red-600',
    },
};

const reviewStatusConfig = {
    waiting: {
        label: 'در انتظار بررسی مدیر',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    detailed_review: {
        label: 'نیازمند بررسی دقیق',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    approved: {
        label: 'تأییدشده',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
};

export default function ReviewCard({ review }) {
    const sensitivity = sensitivityConfig[review.sensitivity];
    const reviewStatus = reviewStatusConfig[review.status];

    return (
        <Link
            href={`/admin/feedbacks/${review.id}`}
            className="block rounded-[18px] border border-[#dce5e1] bg-white p-5 shadow-[0_5px_18px_rgba(20,61,52,0.03)] transition hover:-translate-y-0.5 hover:border-[#c6a45c] hover:shadow-[0_8px_25px_rgba(20,61,52,0.08)] focus:outline-none focus:ring-2 focus:ring-[#c89a3b]/20"
        >
            <article>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-black text-[#173e38]">
                        {review.author}
                    </h2>

                    <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${sensitivity.className}`}
                    >
                        {sensitivity.label}
                    </span>
                </div>

                <p className="mt-4 text-sm leading-8 text-[#263f39]">
                    {review.text}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#394c47]">
                        <span className="font-bold">{review.rating}</span>
                        <span className="mx-1 text-[#7d8985]">از</span>
                        <span>{review.maximumRating}</span>
                    </p>

                    <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${reviewStatus.className}`}
                    >
                        {reviewStatus.label}
                    </span>
                </div>
            </article>
        </Link>
    );
}
