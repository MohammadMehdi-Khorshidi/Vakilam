import CaseDetailsHeader from './CaseDetailsHeader';
import CaseFullInfo from './CaseFullInfo';
import CaseAccessControl from './CaseAccessControl';
import CaseDecision from './CaseDecision';

export default function CaseDetailsPage({ caseData }) {
    return (
        <div className="mx-auto w-full max-w-[1280px]">
            <CaseDetailsHeader caseData={caseData} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.8fr]">
                <CaseAccessControl caseData={caseData} />

                <CaseFullInfo caseData={caseData} />
            </div>

            <CaseDecision />
        </div>
    );
}
