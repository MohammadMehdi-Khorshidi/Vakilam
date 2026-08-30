import { notFound } from 'next/navigation';

import { getContractById } from '../../../../../components/pages/dashboard/admin/(contracts)/contract-details/contractDetailsData';

import ContractDetailsPage from '../../../../../components/pages/dashboard/admin/(contracts)/contract-details/ContractDetailsPage';

export default async function ContractDetailsRoute({ params }) {
    const { contractId } = await params;

    const contract = getContractById(contractId);

    if (!contract) {
        notFound();
    }

    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f4f7f4] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10"
        >
            <ContractDetailsPage contract={contract} />
        </main>
    );
}
