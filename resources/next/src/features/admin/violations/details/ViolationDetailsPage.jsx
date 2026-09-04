import ViolationAccessControl from './ViolationAccessControl';
import ViolationDecision from './ViolationDecision';
import ViolationEvidence from './ViolationEvidence';
import ViolationHeader from './ViolationHeader';
import ViolationInformation from './ViolationInformation';

export default function ViolationDetailsPage({ violation }) {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <ViolationHeader violation={violation} />

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
                    <ViolationInformation violation={violation} />

                    <ViolationAccessControl />
                </div>

                <div className="mt-5">
                    <ViolationEvidence violation={violation} />
                </div>

                <div className="mt-5">
                    <ViolationDecision violationId={violation.id} />
                </div>
            </div>
        </main>
    );
}
