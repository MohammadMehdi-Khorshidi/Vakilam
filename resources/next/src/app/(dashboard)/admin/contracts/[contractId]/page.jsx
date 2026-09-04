import { Vazirmatn } from 'next/font/google';

import ContractDetailsPage from '../../../../../features/admin/contracts/details/ContractDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default async function ContractDetailsRoute({ params }) {
    const { contractId } = await params;

    return (
        <main
            dir="rtl"
            className={`${vazir.className} mt-15 min-h-screen bg-[#f4f7f4] px-4 py-8 text-[#102f29]`}
        >
            <ContractDetailsPage contractId={contractId} />
        </main>
    );
}
