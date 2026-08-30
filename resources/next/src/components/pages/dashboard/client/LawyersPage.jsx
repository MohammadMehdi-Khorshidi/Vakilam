import LawyersHeader from './(lawyers)/LawyersHeader';
import LawyersSummary from './(lawyers)/LawyersSummary';
import LawyersNotice from './(lawyers)/LawyersNotice';
import LawyersFilters from './(lawyers)/LawyersFilters';
import LawyersListHeader from './(lawyers)/LawyersListHeader';
import LawyersList from './(lawyers)/LawyersList';


const LawyersPage = () => {
    return (
        <main dir="rtl" className="mt-12 min-h-screen bg-[#f7faf8] px-8 py-10">
            <LawyersHeader />

            <LawyersSummary />

            <LawyersNotice />

            <LawyersFilters />

            <LawyersListHeader />

            <LawyersList />
        </main>
    );
};

export default LawyersPage;
