import OpportunityHeader from '@/components/pages/dashboard/lawyer/(suggested-cases)/(opportunity)/OpportunityHeader';
import OpportunityStats from '@/components/pages/dashboard/lawyer/(suggested-cases)/(opportunity)/OpportunityStats';
import SmartSummary from '@/components/pages/dashboard/lawyer/(suggested-cases)/(opportunity)/SmartSummary';
import DocumentsCard from '@/components/pages/dashboard/lawyer/(suggested-cases)/(opportunity)/DocumentsCard';
import VisibilityLimitations
    from '@/components/pages/dashboard/lawyer/(suggested-cases)/(opportunity)/VisibilityLimitations';

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
