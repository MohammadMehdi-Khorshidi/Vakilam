'use client';

import {
    BadgeDollarSign,
    ChartNoAxesCombined,
    CreditCard,
    Info,
    WalletCards,
} from 'lucide-react';
import { useMemo } from 'react';


import { earnings } from '../../../features/lawyer/earnings/earningsData';
import EarningsSummaryCard from '@/features/lawyer/earnings/EarningsSummaryCard';
import EarningsTable from '@/features/lawyer/earnings/EarningsTable';

function formatToman(value) {
    return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`;
}

function calculateEarning(item) {
    const totalAmount = Math.max(Number(item.totalAmountToman) || 0, 0);

    const prepayment = Math.min(
        Math.max(Number(item.prepaymentToman) || 0, 0),
        totalAmount,
    );

    const commissionRate = Math.min(
        Math.max(Number(item.commissionRate) || 0, 0),
        100,
    );

    const commission = Math.round((prepayment * commissionRate) / 100);

    const lawyerNetAmount = Math.max(prepayment - commission, 0);

    const conditionsCompleted =
        item.paymentRegistered &&
        item.contractRegistered &&
        item.registeredCopyUploaded &&
        item.clientConfirmed;

    let status = 'blocked';

    if (item.settled) {
        status = 'settled';
    } else if (conditionsCompleted) {
        status = 'ready';
    }

    return {
        ...item,

        prepayment,

        commissionRate,

        commission,

        lawyerNetAmount,

        conditionsCompleted,

        status,
    };
}

export default function EarningsPage() {
    const calculatedEarnings = useMemo(
        () => earnings.map(calculateEarning),
        [],
    );

    const summary = useMemo(() => {
        return calculatedEarnings.reduce(
            (result, item) => {
                result.paymentCount += item.paymentRegistered ? 1 : 0;

                result.totalPrepayment += item.prepayment;

                result.totalCommission += item.commission;

                if (item.status === 'ready') {
                    result.readyForSettlement += item.lawyerNetAmount;
                }

                result.totalSettled += item.settled ? item.lawyerNetAmount : 0;

                return result;
            },
            {
                paymentCount: 0,
                totalPrepayment: 0,
                totalCommission: 0,
                readyForSettlement: 0,
                totalSettled: 0,
            },
        );
    }, [calculatedEarnings]);

    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <header className="mb-8 pt-4">


                <h1 className="mt-5 text-3xl font-black leading-tight text-[#0b302b] sm:text-4xl">
                    نمای تجمیعی سهم و تسویه
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#75847f]">
                    هر ردیف مالی به پرونده و رابطه همکاری مشخص متصل است. کمیسیون
                    وکیلم از سهم وکیل کسر می‌شود.
                </p>
            </header>

            <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <EarningsSummaryCard
                    icon={ChartNoAxesCombined}
                    title="همکاری دارای پرداخت"
                    value={summary.paymentCount.toLocaleString('fa-IR')}
                />

                <EarningsSummaryCard
                    icon={CreditCard}
                    title="پیش‌پرداخت ثبت‌شده"
                    value={formatToman(summary.totalPrepayment)}
                />

                <EarningsSummaryCard
                    icon={BadgeDollarSign}
                    title="کمیسیون محاسبه‌شده"
                    value={formatToman(summary.totalCommission)}
                />

                <EarningsSummaryCard
                    icon={WalletCards}
                    title="آماده بررسی تسویه"
                    value={formatToman(summary.readyForSettlement)}
                />
            </section>

            <EarningsTable earnings={calculatedEarnings} />

            <section className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                    <Info size={19} />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-[#183d36]">
                        کنترل‌های مالی
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[#71817d]">
                        آزادسازی سهم فقط پس از ثبت پیش‌پرداخت، ثبت قرارداد،
                        بارگذاری نسخه ثبت‌شده و تأیید موکل قابل بررسی است. این
                        صفحه فقط شبیه‌سازی فرانت است و پرداخت بانکی واقعی انجام
                        نمی‌دهد.
                    </p>
                </div>
            </section>
        </div>
    );
}
