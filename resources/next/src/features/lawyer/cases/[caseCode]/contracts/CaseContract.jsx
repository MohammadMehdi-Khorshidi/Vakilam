'use client';

import { CheckCircle2, FileText, Info, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import ContractStep from './ContractStep';
import ContractInfoItem from './ContractInfoItem';

import { calculateContractAmounts } from '../contractCalculations';

function formatToman(value) {
    const normalizedValue = Number(value);

    if (!Number.isFinite(normalizedValue)) {
        return 'ثبت نشده';
    }

    return `${new Intl.NumberFormat('fa-IR').format(normalizedValue)} تومان`;
}

function getInitialContractState(contract, storageKey) {
    if (!contract) {
        return null;
    }

    if (typeof window === 'undefined') {
        return contract;
    }

    try {
        const storedState = window.localStorage.getItem(storageKey);

        if (!storedState) {
            return contract;
        }

        const parsedState = JSON.parse(storedState);

        if (
            !parsedState ||
            typeof parsedState !== 'object' ||
            Array.isArray(parsedState)
        ) {
            return contract;
        }

        return {
            ...contract,
            ...parsedState,
        };
    } catch {
        return contract;
    }
}

export default function CaseContract({ caseItem }) {
    const contract = caseItem?.contract;

    const storageKey = `vakilam-case-contract-${caseItem?.code}`;

    const fileInputRef = useRef(null);
    const fileUrlRef = useRef(null);

    const [contractState, setContractState] = useState(() =>
        getInitialContractState(contract, storageKey),
    );

    const [registeredFile, setRegisteredFile] = useState(null);

    const [error, setError] = useState('');

    const amounts = useMemo(
        () => calculateContractAmounts(contractState),
        [contractState],
    );

    useEffect(() => {
        if (!contractState) {
            return;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(contractState));
    }, [contractState, storageKey]);

    useEffect(() => {
        return () => {
            if (fileUrlRef.current) {
                URL.revokeObjectURL(fileUrlRef.current);
            }
        };
    }, []);

    if (!contractState) {
        return (
            <section className="rounded-2xl border border-[#dce6e2] bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-[#879590]">
                    قراردادی برای این رابطه همکاری ثبت نشده است.
                </p>
            </section>
        );
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const acceptedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!acceptedTypes.includes(file.type)) {
            setError('فقط فایل PDF، JPG، PNG یا WEBP مجاز است.');

            event.target.value = '';

            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');

            event.target.value = '';

            return;
        }

        if (fileUrlRef.current) {
            URL.revokeObjectURL(fileUrlRef.current);
        }

        const previewUrl = URL.createObjectURL(file);

        fileUrlRef.current = previewUrl;

        const uploadedAt = new Date().toISOString();

        setRegisteredFile({
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl,
            uploadedAt,
        });

        setContractState((currentState) => ({
            ...currentState,
            registeredCopyUploaded: true,
            registeredFileName: file.name,
            registeredFileUploadedAt: uploadedAt,
        }));

        setError('');

        event.target.value = '';
    }

    function handleClientConfirmation() {
        if (!contractState.registeredCopyUploaded) {
            window.alert('ابتدا نسخه ثبت‌شده قرارداد را بارگذاری کنید.');

            return;
        }

        setContractState((currentState) => ({
            ...currentState,
            clientConfirmed: true,
            clientConfirmedAt: new Date().toISOString(),
        }));
    }

    function handleLawyerSettlement() {
        if (!contractState.clientConfirmed) {
            window.alert('ابتدا باید تأیید موکل ثبت شود.');

            return;
        }

        setContractState((currentState) => ({
            ...currentState,
            lawyerSettled: true,
            lawyerSettledAt: new Date().toISOString(),
            lawyerSettledAmountToman: amounts.lawyerNetPrepayment,
        }));
    }

    const steps = [
        {
            number: 1,
            title: 'پیش‌پرداخت',
            description: `${formatToman(
                amounts.prepayment,
            )} · ${amounts.paidPercent.toLocaleString('fa-IR')}٪ مبلغ قرارداد`,
            status: contractState.paymentCompleted ? 'completed' : 'current',
        },
        {
            number: 2,
            title: 'ثبت در عدل ایران',
            description: contractState.adliranCode || 'منتظر ثبت',
            status: contractState.registeredInAdliran
                ? 'completed'
                : contractState.paymentCompleted
                  ? 'current'
                  : 'pending',
        },
        {
            number: 3,
            title: 'بارگذاری نسخه',
            description: contractState.registeredCopyUploaded
                ? 'نسخه ثبت‌شده بارگذاری شده است'
                : 'نسخه ثبت‌شده را بارگذاری کنید',
            status: contractState.registeredCopyUploaded
                ? 'completed'
                : contractState.registeredInAdliran
                  ? 'current'
                  : 'pending',
        },
        {
            number: 4,
            title: 'تأیید موکل',
            description: contractState.clientConfirmed
                ? 'موکل قرارداد را تأیید کرده است'
                : 'در انتظار تأیید موکل',
            status: contractState.clientConfirmed
                ? 'completed'
                : contractState.registeredCopyUploaded
                  ? 'current'
                  : 'pending',
        },
        {
            number: 5,
            title: 'تسویه سهم وکیل',
            description: contractState.lawyerSettled
                ? `${formatToman(amounts.lawyerNetPrepayment)} تسویه شده است`
                : `${formatToman(
                      amounts.lawyerNetPrepayment,
                  )} منتظر تأیید موکل`,
            status: contractState.lawyerSettled
                ? 'completed'
                : contractState.clientConfirmed
                  ? 'current'
                  : 'pending',
        },
    ];

    return (
        <div className="space-y-5">
            <section className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                    <Info size={19} />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-[#183d36]">
                        اتصال قرارداد
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[#71817d]">
                        قرارداد متعلق به رابطه همکاری{' '}
                        {contractState.engagementCode} است، نه صرفاً عنوان
                        پرونده.
                    </p>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {steps.map((step) => (
                    <ContractStep
                        key={step.number}
                        number={step.number}
                        title={step.title}
                        description={step.description}
                        status={step.status}
                    />
                ))}
            </section>

            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <header className="border-b border-[#edf1ef] pb-5">
                    <h2 className="text-xl font-bold text-[#123b34]">
                        جزئیات قرارداد
                    </h2>
                </header>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <ContractInfoItem label="شناسه قرارداد">
                        {contractState.id}
                    </ContractInfoItem>

                    <ContractInfoItem label="شناسه عدل ایران">
                        {contractState.adliranCode}
                    </ContractInfoItem>

                    <ContractInfoItem label="مبلغ کل قرارداد">
                        {formatToman(amounts.totalAmount)}
                    </ContractInfoItem>

                    <ContractInfoItem label="پیش‌پرداخت">
                        {formatToman(amounts.prepayment)}
                    </ContractInfoItem>

                    <ContractInfoItem label="درصد پرداخت‌شده">
                        {amounts.paidPercent.toLocaleString('fa-IR')}٪
                    </ContractInfoItem>

                    <ContractInfoItem label="مانده قرارداد">
                        {formatToman(amounts.remainingContractAmount)}
                    </ContractInfoItem>

                    <ContractInfoItem
                        label={`کمیسیون وکیلم (${amounts.commissionRate.toLocaleString(
                            'fa-IR',
                        )}٪ پیش‌پرداخت)`}
                    >
                        {formatToman(amounts.platformCommission)}
                    </ContractInfoItem>

                    <ContractInfoItem label="سهم خالص وکیل از پیش‌پرداخت">
                        {formatToman(amounts.lawyerNetPrepayment)}
                    </ContractInfoItem>

                    <ContractInfoItem label="وضعیت قرارداد">
                        {contractState.lawyerSettled
                            ? 'تسویه‌شده'
                            : contractState.clientConfirmed
                              ? 'تأییدشده توسط موکل'
                              : contractState.registeredInAdliran
                                ? 'ثبت‌شده در عدل ایران'
                                : 'در حال تکمیل'}
                    </ContractInfoItem>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {(registeredFile || contractState.registeredFileName) && (
                    <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-lg bg-white text-emerald-700">
                                <FileText size={20} />
                            </div>

                            <div>
                                <strong className="block text-sm text-[#183d36]">
                                    {registeredFile?.name ||
                                        contractState.registeredFileName}
                                </strong>

                                <span className="mt-1 block text-xs text-emerald-700">
                                    نسخه ثبت‌شده انتخاب شده است.
                                </span>
                            </div>
                        </div>

                        {registeredFile?.previewUrl && (
                            <a
                                href={registeredFile.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-center text-sm font-bold text-emerald-700"
                            >
                                مشاهده فایل
                            </a>
                        )}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0b5648] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073f35]"
                    >
                        <UploadCloud size={18} />
                        بارگذاری نسخه ثبت‌شده
                    </button>

                    {!contractState.clientConfirmed && (
                        <button
                            type="button"
                            disabled={!contractState.registeredCopyUploaded}
                            onClick={handleClientConfirmation}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d8b45d] bg-[#fffaf0] px-5 py-3 text-sm font-bold text-[#183d36] transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCircle2 size={18} />
                            ثبت تأیید نمایشی موکل
                        </button>
                    )}

                    {contractState.clientConfirmed &&
                        !contractState.lawyerSettled && (
                            <button
                                type="button"
                                onClick={handleLawyerSettlement}
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                            >
                                <CheckCircle2 size={18} />
                                تسویه {formatToman(amounts.lawyerNetPrepayment)}
                            </button>
                        )}
                </div>
            </section>
        </div>
    );
}
