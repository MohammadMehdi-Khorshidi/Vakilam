import { Vazirmatn } from 'next/font/google';
import ProposalsHeader from './ProposalsHeader';
import ProposalsTable from './ProposalsTable';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ProposalsPage = () => {
    return (
        <div dir="rtl" className={`${vazir.className} w-full`}>
            <ProposalsHeader />

            <ProposalsTable />
        </div>
    );
};

export default ProposalsPage;
