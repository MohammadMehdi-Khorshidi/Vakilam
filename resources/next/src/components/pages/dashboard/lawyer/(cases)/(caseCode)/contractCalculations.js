function normalizeMoney(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        return 0;
    }

    return Math.round(number);
}

function normalizeRate(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.min(Math.max(number, 0), 100);
}

export function calculateContractAmounts(contract) {
    const totalAmount = normalizeMoney(contract?.totalAmountToman);

    const requestedPrepayment = normalizeMoney(contract?.prepaymentToman);

    const prepayment = Math.min(requestedPrepayment, totalAmount);

    const commissionRate = normalizeRate(contract?.platformCommissionRate);

    const platformCommission = Math.round((prepayment * commissionRate) / 100);

    const lawyerNetPrepayment = Math.max(prepayment - platformCommission, 0);

    const remainingContractAmount = Math.max(totalAmount - prepayment, 0);

    const paidPercent =
        totalAmount > 0 ? Math.round((prepayment / totalAmount) * 100) : 0;

    return {
        totalAmount,
        prepayment,
        commissionRate,
        platformCommission,
        lawyerNetPrepayment,
        remainingContractAmount,
        paidPercent,
    };
}
