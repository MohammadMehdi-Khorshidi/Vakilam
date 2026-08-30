import VerificationHeader from './VerificationHeader';
import VerificationMainInfo from './VerificationMainInfo';
import VerificationDocumentItem from './VerificationDocumentItem';
import VerificationDecision from './VerificationDecision';


export default function VerificationDetailsPage({ verification }) {
    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1280px]">
            {/* Header */}

            <VerificationHeader verification={verification} />

            {/* Top Sections */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <VerificationMainInfo verification={verification} />

                <VerificationDocumentItem documents={verification.documents} />
            </div>

            {/* Decision */}

            <VerificationDecision />
        </div>
    );
}
