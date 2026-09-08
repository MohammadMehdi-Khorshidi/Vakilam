import LawyersHeader from '../../../features/client/lawyers/LawyersHeader';
import LawyersList from '../../../features/client/lawyers/LawyersList';

const LawyersPage = () => {
    return (
        <main dir="rtl" className="mt-12 min-h-screen bg-[#f7faf8] px-8 py-10">
            <LawyersHeader />

            <LawyersList />
        </main>
    );
};

export default LawyersPage;
