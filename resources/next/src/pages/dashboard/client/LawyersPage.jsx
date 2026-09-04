import LawyersHeader from '../../../features/client/lawyers/LawyersHeader';
import LawyersSummary from '../../../features/client/lawyers/LawyersSummary';
import LawyersNotice from '../../../features/client/lawyers/LawyersNotice';
import LawyersFilters from '../../../features/client/lawyers/LawyersFilters';
import LawyersListHeader from '../../../features/client/lawyers/LawyersListHeader';
import LawyersList from '../../../features/client/lawyers/LawyersList';


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
