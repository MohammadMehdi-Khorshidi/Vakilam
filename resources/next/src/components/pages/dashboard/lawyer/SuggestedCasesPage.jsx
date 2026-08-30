import SuggestedCasesHeader from './(suggested-cases)/SuggestedCasesHeader';
import PrivacyNotice from './(suggested-cases)/PrivacyNotice';
import SuggestedCasesList from './(suggested-cases)/SuggestedCasesList';


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
