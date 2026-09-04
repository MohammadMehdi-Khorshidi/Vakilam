import LawyerDetailsHeader from './LawyerDetailsHeader';
import LawyerRecordCard from './LawyerRecordCard';
import LawyerAccessControl from './LawyerAccessControl';
import LawyerAdminDecision from './LawyerAdminDecision';


export default function LawyerDetailsPage({ lawyer }) {
    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <LawyerDetailsHeader lawyer={lawyer} />

            <section className="grid items-stretch gap-5 xl:grid-cols-[1.8fr_0.95fr]">
                <LawyerRecordCard lawyer={lawyer} />

                <LawyerAccessControl lawyer={lawyer} />
            </section>

            <LawyerAdminDecision lawyerId={lawyer.id} />
        </div>
    );
}
