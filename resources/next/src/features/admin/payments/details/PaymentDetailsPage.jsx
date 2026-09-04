import ContractHeader from './ContractHeader';
import ContractInfoCard from './ContractInfoCard';
import ContractAccessCard from './ContractAccessCard';
import ContractFinancialStatus from './ContractFinancialStatus';
import ContractDecisionCard from './ContractDecisionCard';

export default function ContractDetailsPage({ contract }) {
    if (!contract) {
        return null;
    }

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1280px]">
            {/* هدر */}
            <ContractHeader contract={contract} />

            {/* دو کارت اول */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                {/* کنترل دسترسی و سابقه */}
                <ContractAccessCard contract={contract} />

                {/* اطلاعات کامل رکورد */}
                <ContractInfoCard contract={contract} />
            </div>

            {/* وضعیت مالی و شرایط تسویه */}
            <ContractFinancialStatus contract={contract} />

            {/* تصمیم و اقدام مدیر */}
            <ContractDecisionCard contract={contract} />
        </div>
    );
}
