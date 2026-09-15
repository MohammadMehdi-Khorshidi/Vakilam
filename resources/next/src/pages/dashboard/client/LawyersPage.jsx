import LawyersHeader from '../../../features/client/lawyers/LawyersHeader';
import LawyersList from '../../../features/client/lawyers/LawyersList';

const LawyersPage = () => {
    return (
        <main dir="rtl" className="min-h-screen bg-[#f7faf8] px-5 py-6 sm:px-8">
            <LawyersHeader />
            <LawyersList />
        </main>
    );
};

export default LawyersPage;
