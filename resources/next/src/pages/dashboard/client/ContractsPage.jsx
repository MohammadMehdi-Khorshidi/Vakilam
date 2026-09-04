'use client';

import { Vazirmatn } from 'next/font/google';
import ContractHeader from '../../../features/client/contracts/ContractHeader';
import PartiesCard from '../../../features/client/contracts/PartiesCard';

import FinancialSummary from '../../../features/client/contracts/FinancialSummary';
import CooperationSteps from '../../../features/client/contracts/CooperationSteps';
import ContractNotice from '../../../features/client/contracts/ContractNotice';



const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});
const ContractsPage = () => {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-[calc(100vh-80px)] bg-[#f8faf9]`}
        >
            <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8">
                <ContractHeader />

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <PartiesCard />
                    <FinancialSummary />
                </div>

                <div className="mt-4">
                    <CooperationSteps />
                </div>

                <div className="mt-4">
                    <ContractNotice />
                </div>
            </div>
        </main>
    );
};
export default ContractsPage;
