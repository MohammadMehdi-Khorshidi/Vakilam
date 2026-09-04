import SuggestedCasesHeader from '../../../features/lawyer/suggested-cases/SuggestedCasesHeader';
import PrivacyNotice from '../../../features/lawyer/suggested-cases/PrivacyNotice';
import SuggestedCasesList from '../../../features/lawyer/suggested-cases/SuggestedCasesList';


const SuggestedCasesPage = () => {
    return (
        <div dir="rtl" className="w-full">
            <SuggestedCasesHeader />

            <PrivacyNotice />

            <SuggestedCasesList />
        </div>
    );
};

export default SuggestedCasesPage;
