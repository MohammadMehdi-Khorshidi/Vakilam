'use client';

import {
    Check,
    CheckCircle2,
    Clock3,
    FileCheck2,
    Info,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { calculateContractAmounts } from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/contractCalculations';

function formatToman(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 'ثبت نشده';
    }

    return `${new Intl.NumberFormat('fa-IR').format(number)} تومان`;
}

function formatPersianDate(date) {
    if (!date) {
        return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '—';
    }

    return parsedDate.toLocaleString('fa-IR', {
        calendar: 'persian',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

const statusStyles = {
    held: {
        label: 'ثبت‌شده در حساب وکیلم',
        className: 'border-sky-200 bg-sky-50 text-sky-700',
    },

    pending: {
        label: 'منتظر تأیید موکل',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    settled: {
        label: 'تسویه‌شده',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
};

function PaymentStatus({ status }) {
    const config = statusStyles[status] ?? statusStyles.pending;

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
        >
            {config.label}
        </span>
    );
}

function PaymentRow({ id, title, amount, date, status }) {
    return (
        <tr className="border-b border-[#edf1ef] last:border-b-0">
            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#183d36]">
                {id}
            </td>

            <td className="min-w-56 px-4 py-4 text-sm text-[#52635e]">
                {title}
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#183d36]">
                {formatToman(amount)}
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-sm text-[#657571]">
                {formatPersianDate(date)}
            </td>

            <td className="whitespace-nowrap px-4 py-4">
                <PaymentStatus status={status} />
            </td>
        </tr>
    );
}

function ReleaseCondition({ completed, icon: Icon, children }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-4 ${
                completed
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                    : 'border-[#e3eae7] bg-white text-[#657571]'
            }`}
        >
            <div
                className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                    completed
                        ? 'bg-white text-emerald-700'
                        : 'bg-[#f5f8f6] text-[#879590]'
                }`}
            >
                {completed ? <Check size={18} /> : <Icon size={18} />}
            </div>

            <span className="text-sm font-bold leading-7">{children}</span>
        </div>
    );
}

export default function CasePayments({ caseItem }) {
    const defaultContract = caseItem.contract;

    const contractStorageKey = `vakilam-case-contract-${caseItem.code}`;

    const [contractState, setContractState] = useState(defaultContract);

    const [isLoaded, setIsLoaded] = useState(false);

    const amounts = useMemo(
        () => calculateContractAmounts(contractState),
        [contractState],
    );

    useEffect(() => {
        try {
            const storedContract =
                window.localStorage.getItem(contractStorageKey);

            if (storedContract) {
                const parsedContract = JSON.parse(storedContract);

                setContractState((currentContract) => ({
                    ...currentContract,
                    ...parsedContract,
                }));
            }
        } catch {
            setContractState(defaultContract);
        } finally {
            setIsLoaded(true);
        }
    }, [contractStorageKey, defaultContract]);

    useEffect(() => {
        if (!isLoaded || !contractState) {
            return;
        }

        window.localStorage.setItem(
            contractStorageKey,
            JSON.stringify(contractState),
        );
    }, [contractState, contractStorageKey, isLoaded]);

    if (!contractState) {
        return (
            <section className="rounded-2xl border border-[#dce6e2] bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-[#879590]">
                    اطلاعات مالی این همکاری موجود نیست.
                </p>
            </section>
        );
    }

    const releaseConditions = {
        paymentReceived: contractState.paymentCompleted,

        registeredInAdliran: contractState.registeredInAdliran,

        registeredCopyUploaded: contractState.registeredCopyUploaded,

        clientConfirmed: contractState.clientConfirmed,
    };

    const canSettle = Object.values(releaseConditions).every(Boolean);

    const payments = [
        {
            id: 'PAY-6101',

            title: 'پیش‌پرداخت همکاری',

            amount: amounts.prepayment,

            date: contractState.prepaymentPaidAt,

            status: 'held',
        },

        {
            id: 'PAY-6101-S',

            title: 'سهم وکیل پس از کسر کمیسیون',

            amount: amounts.lawyerNetPrepayment,

            date: contractState.lawyerSettledAt,

            status: contractState.lawyerSettled ? 'settled' : 'pending',
        },
    ];

    function handleSettlement() {
        if (!canSettle) {
            window.alert('تمام شروط آزادسازی سهم وکیل تکمیل نشده‌اند.');

            return;
        }

        if (contractState.lawyerSettled) {
            return;
        }

        const settledAt = new Date().toISOString();

        setContractState((currentContract) => ({
            ...currentContract,

            lawyerSettled: true,

            lawyerSettledAt: settledAt,

            lawyerSettledAmountToman: amounts.lawyerNetPrepayment,
        }));
    }

    return (
        <div className="space-y-5">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    icon={WalletCards}
                    title="مبلغ کل قرارداد"
                    value={formatToman(amounts.totalAmount)}
                />

                <SummaryCard
                    icon={ShieldCheck}
                    title="پیش‌پرداخت ثبت‌شده"
                    value={formatToman(amounts.prepayment)}
                />

                <SummaryCard
                    icon={Info}
                    title={`کمیسیون وکیلم (${amounts.commissionRate.toLocaleString(
                        'fa-IR',
                    )}٪)`}
                    value={formatToman(amounts.platformCommission)}
                />

                <SummaryCard
                    icon={CheckCircle2}
                    title="سهم خالص وکیل"
                    value={formatToman(amounts.lawyerNetPrepayment)}
                />
            </section>

            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <header className="border-b border-[#edf1ef] pb-5">
                    <h2 className="text-xl font-bold text-[#123b34]">
                        پرداخت‌های همین همکاری
                    </h2>

                    <p className="mt-2 text-sm text-[#879590]">
                        رابطه همکاری {contractState.engagementCode}
                    </p>
                </header>

                <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse text-right">
                        <thead>
                            <tr className="border-b border-[#e3eae7] bg-[#fafcfb]">
                                <th className="px-4 py-4 text-xs text-[#75847f]">
                                    شناسه
                                </th>

                                <th className="px-4 py-4 text-xs text-[#75847f]">
                                    عنوان
                                </th>

                                <th className="px-4 py-4 text-xs text-[#75847f]">
                                    مبلغ
                                </th>

                                <th className="px-4 py-4 text-xs text-[#75847f]">
                                    تاریخ
                                </th>

                                <th className="px-4 py-4 text-xs text-[#75847f]">
                                    وضعیت
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((payment) => (
                                <PaymentRow key={payment.id} {...payment} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <header className="border-b border-[#edf1ef] pb-5">
                    <h2 className="text-xl font-bold text-[#123b34]">
                        شروط آزادسازی سهم وکیل
                    </h2>
                </header>

                <div className="mt-5 space-y-3">
                    <ReleaseCondition
                        completed={releaseConditions.paymentReceived}
                        icon={Clock3}
                    >
                        پیش‌پرداخت به مبلغ {formatToman(amounts.prepayment)} در
                        حساب وکیلم ثبت شده است.
                    </ReleaseCondition>

                    <ReleaseCondition
                        completed={releaseConditions.registeredInAdliran}
                        icon={Clock3}
                    >
                        قرارداد در عدل ایران ثبت شده است.
                    </ReleaseCondition>

                    <ReleaseCondition
                        completed={releaseConditions.registeredCopyUploaded}
                        icon={FileCheck2}
                    >
                        نسخه ثبت‌شده قرارداد بارگذاری شده است.
                    </ReleaseCondition>

                    <ReleaseCondition
                        completed={releaseConditions.clientConfirmed}
                        icon={Clock3}
                    >
                        موکل نسخه ثبت‌شده را تأیید کرده است.
                    </ReleaseCondition>
                </div>

                <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <div className="flex items-start gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                            <Info size={19} />
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-[#183d36]">
                                محاسبه تسویه
                            </h3>

                            <p className="mt-2 text-sm leading-7 text-[#71817d]">
                                از پیش‌پرداخت {formatToman(amounts.prepayment)}،
                                مبلغ {formatToman(amounts.platformCommission)}{' '}
                                به‌عنوان کمیسیون کسر می‌شود و مبلغ{' '}
                                {formatToman(amounts.lawyerNetPrepayment)} سهم
                                خالص وکیل است.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSettlement}
                        disabled={!canSettle || contractState.lawyerSettled}
                        className="rounded-xl bg-[#0b5648] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073f35] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {contractState.lawyerSettled
                            ? `تسویه ${formatToman(
                                  amounts.lawyerNetPrepayment,
                              )} انجام شد`
                            : `تسویه نمایشی ${formatToman(
                                  amounts.lawyerNetPrepayment,
                              )}`}
                    </button>
                </div>
            </section>
        </div>
    );
}

function SummaryCard({ icon: Icon, title, value }) {
    return (
        <article className="rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-[#7a8985]">{title}</p>

                    <strong className="mt-2 block text-lg text-[#123b34]">
                        {value}
                    </strong>
                </div>

                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf6f2] text-[#0b5648]">
                    <Icon size={20} />
                </div>
            </div>
        </article>
    );
}
