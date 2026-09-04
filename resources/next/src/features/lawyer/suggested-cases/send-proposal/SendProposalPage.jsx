import { Vazirmatn } from 'next/font/google';
import ProposalHeader from './ProposalHeader';
import ProposalForm from './ProposalForm';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const SendProposalPage = () => {
    return (
        <div dir="rtl" className={`${vazir.className} w-full`}>
            <ProposalHeader />

            <ProposalForm />
        </div>
    );
};

export default SendProposalPage;
