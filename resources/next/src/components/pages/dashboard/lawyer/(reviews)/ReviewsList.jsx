import ReviewItem from '@/components/pages/dashboard/lawyer/(reviews)/ReviewItem';

export default function ReviewsList({ reviews }) {
    return (
        <section className="mt-5 rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="border-b border-[#edf1ef] pb-5">
                <h2 className="text-xl font-bold text-[#123b34]">
                    بازخوردهای بررسی‌شده
                </h2>
            </header>

            {reviews.length ? (
                <div className="mt-5 space-y-3">
                    {reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))}
                </div>
            ) : (
                <p className="py-14 text-center text-sm text-[#879590]">
                    هنوز بازخوردی برای نمایش وجود ندارد.
                </p>
            )}
        </section>
    );
}
