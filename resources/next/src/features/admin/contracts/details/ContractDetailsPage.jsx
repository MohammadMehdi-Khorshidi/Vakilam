import ContractHeader from './ContractHeader';
import ContractInfoCard from './ContractInfoCard';
import ContractAccessCard from './ContractAccessCard';
import ContractFinancialStatus from './ContractFinancialStatus';
import ContractDecision from './ContractDecision';

export default function ContractDetailsPage({ contract }) {
    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1400px]">
            <ContractHeader contract={contract} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <ContractAccessCard contract={contract} />

                <ContractInfoCard contract={contract} />
            </div>

            <ContractFinancialStatus contract={contract} />

            <ContractDecision />
        </div>
    );
}
