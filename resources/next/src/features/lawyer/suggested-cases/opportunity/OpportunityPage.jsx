import OpportunityHeader from './OpportunityHeader';
import OpportunityStats from './OpportunityStats';
import SmartSummary from './SmartSummary';
import DocumentsCard from './DocumentsCard';
import VisibilityLimitations
    from './VisibilityLimitations';

const OpportunityPage = ({ id }) => {
    return (
        <div dir="ltr" className="w-full">
            <OpportunityHeader id={id} />

            <OpportunityStats />

            <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <SmartSummary />

                <DocumentsCard />
            </section>

            <div className="mt-5">
                <VisibilityLimitations />
            </div>
        </div>
    );
};

export default OpportunityPage;
