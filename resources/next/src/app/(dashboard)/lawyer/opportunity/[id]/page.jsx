import OpportunityPage from '../../../../../features/lawyer/suggested-cases/opportunity/OpportunityPage';

export default async function OpportunityDetailsPage({ params }) {
    const { id } = await params;

    return (
        <main
            dir="rtl"
            className="mt-20 w-full min-w-0 bg-[#f6f8f5] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <OpportunityPage id={id} />
            </div>
        </main>
    );
}
