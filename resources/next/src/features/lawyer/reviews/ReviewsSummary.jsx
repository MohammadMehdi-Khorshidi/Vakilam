import ReviewSummaryCard from './ReviewSummaryCard';

function calculateAverage(items, field) {
    if (!items.length) {
        return 0;
    }

    const total = items.reduce(
        (sum, item) => sum + (Number(item[field]) || 0),
        0,
    );

    return total / items.length;
}

function formatScore(score) {
    return new Intl.NumberFormat('fa-IR', {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
    }).format(score);
}

export default function ReviewsSummary({ reviews }) {
    const totalScore = calculateAverage(reviews, 'score');

    const responsiveness = calculateAverage(reviews, 'responsiveness');

    const transparency = calculateAverage(reviews, 'transparency');

    const organization = calculateAverage(reviews, 'organization');

    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ReviewSummaryCard
                title="امتیاز کل"
                value={`${formatScore(totalScore)} از ۵`}
            />

            <ReviewSummaryCard
                title="پاسخ‌گویی"
                value={formatScore(responsiveness)}
            />

            <ReviewSummaryCard
                title="شفافیت"
                value={formatScore(transparency)}
            />

            <ReviewSummaryCard
                title="نظم و پیگیری"
                value={formatScore(organization)}
            />
        </section>
    );
}
