import ReviewCard from './(reviews)/ReviewCard';
import ReviewsHeader from './(reviews)/ReviewsHeader';
import { reviews } from './(reviews)/reviewsData';

export default function ReviewsPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-10 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <ReviewsHeader />

                <section className="grid gap-4 lg:grid-cols-2">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </section>
            </div>
        </main>
    );
}
