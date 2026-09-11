'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Search, SlidersHorizontal, X } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import LawyerCard from '@/components/carts/LawyerCard';
import {
    listSelectableLawyers,
    runLawyerMatching,
    sendAdditionalLawyerRequests,
    sendLawyerRequests,
} from '@/lib/api/legalRequests';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const SELECTION_LIMIT = 5;

const SORT_OPTIONS = [
    { key: 'topic', label: 'ارتباط با موضوع' },
    { key: 'location', label: 'نزدیکی موقعیت' },
    { key: 'experience', label: 'سابقه بیشتر' },
    { key: 'rating', label: 'امتیاز بالاتر کاربران' },
];

const DEFAULT_SORTS = ['topic', 'location'];
const BLOCKED_INVITE_STATUSES = new Set([
    'pending',
    'negotiating',
    'rejected',
    'closed',
    'selected',
]);

function priorityScore(item, activeSorts) {
    const metrics = item?.sort_metrics ?? {};
    let score = 0;

    if (activeSorts.includes('topic') && metrics.topic_match) score += 40;

    if (activeSorts.includes('location')) {
        score +=
            Math.max(0, Math.min(Number(metrics.location) || 0, 2)) * 12.5;
    }

    if (activeSorts.includes('experience')) {
        score += Math.min(
            Math.max(Number(metrics.experience) || 0, 0),
            20,
        );
    }

    if (activeSorts.includes('rating')) {
        score += Math.min(
            Math.max(Number(metrics.rating) || 0, 0) * 3,
            15,
        );
    }

    return score;
}

export default function LawyersList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const legalRequestId = searchParams.get('legal_request_id');
    const additionalMode = searchParams.get('mode') === 'additional';

    const [lawyers, setLawyers] = useState([]);
    const [activeSorts, setActiveSorts] = useState(DEFAULT_SORTS);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMeta, setSelectionMeta] = useState({
        limit: SELECTION_LIMIT,
        selected_count: 0,
        remaining_count: SELECTION_LIMIT,
    });
    const [initialSelectionCompleted, setInitialSelectionCompleted] =
        useState(false);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 300);

        return () => window.clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        let mounted = true;

        async function loadLawyers() {
            if (!legalRequestId) {
                if (mounted) {
                    setLoading(false);
                    setError('شناسه درخواست حقوقی مشخص نیست.');
                }
                return;
            }

            setLoading(true);
            setError('');

            try {
                await runLawyerMatching(legalRequestId);

                const first = await listSelectableLawyers(legalRequestId, {
                    q: debouncedQuery || undefined,
                    per_page: 50,
                    page: 1,
                });

                if (!mounted) return;

                let all = [...(first?.data ?? [])];
                const lastPage =
                    Number(first?.meta?.pagination?.last_page) || 1;

                for (let page = 2; page <= lastPage; page += 1) {
                    const response = await listSelectableLawyers(
                        legalRequestId,
                        {
                            q: debouncedQuery || undefined,
                            per_page: 50,
                            page,
                        },
                    );

                    if (!mounted) return;
                    all = [...all, ...(response?.data ?? [])];
                }

                setLawyers(all);
                setInitialSelectionCompleted(
                    Boolean(first?.meta?.initial_selection_completed),
                );
                setSelectionMeta(
                    first?.meta?.selection ?? {
                        limit: SELECTION_LIMIT,
                        selected_count: 0,
                        remaining_count: SELECTION_LIMIT,
                    },
                );
            } catch (requestError) {
                if (mounted) {
                    setError(
                        requestError?.message ||
                            'دریافت فهرست وکلا با خطا مواجه شد.',
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadLawyers();

        return () => {
            mounted = false;
        };
    }, [legalRequestId, debouncedQuery]);

    const toggleSort = (key) => {
        setActiveSorts((previous) =>
            previous.includes(key)
                ? previous.filter((item) => item !== key)
                : [...previous, key],
        );
    };

    const sortedLawyers = useMemo(() => {
        if (activeSorts.length === 0) return lawyers;

        return lawyers
            .map((item, index) => ({ item, index }))
            .sort((first, second) => {
                const scoreDifference =
                    priorityScore(second.item, activeSorts) -
                    priorityScore(first.item, activeSorts);

                return scoreDifference || first.index - second.index;
            })
            .map(({ item }) => item);
    }, [lawyers, activeSorts]);

    const maxSelectable = Math.max(
        0,
        Number(selectionMeta?.remaining_count ?? SELECTION_LIMIT),
    );

    const selectionLocked =
        (!additionalMode && initialSelectionCompleted) || maxSelectable === 0;

    const toggleLawyer = (publicId, inviteStatus) => {
        if (selectionLocked || BLOCKED_INVITE_STATUSES.has(inviteStatus)) {
            return;
        }

        setError('');

        setSelectedIds((previous) => {
            if (previous.includes(publicId)) {
                return previous.filter((item) => item !== publicId);
            }

            if (previous.length >= maxSelectable) {
                setError(
                    'سقف دعوت فعال وکیل برای این درخواست تکمیل شده است.',
                );
                return previous;
            }

            return [...previous, publicId];
        });
    };

    const submitSelection = async () => {
        if (
            !legalRequestId ||
            sending ||
            selectionLocked ||
            selectedIds.length === 0
        ) {
            return;
        }

        setSending(true);
        setError('');

        try {
            if (additionalMode) {
                await sendAdditionalLawyerRequests(
                    legalRequestId,
                    selectedIds,
                );

                setSelectionMeta((previous) => ({
                    ...previous,
                    selected_count:
                        Number(previous?.selected_count || 0) +
                        selectedIds.length,
                    remaining_count: Math.max(
                        0,
                        Number(previous?.remaining_count || 0) -
                            selectedIds.length,
                    ),
                }));
            } else {
                const response = await sendLawyerRequests(
                    legalRequestId,
                    selectedIds,
                );

                setSelectionMeta(
                    response?.meta?.selection ?? selectionMeta,
                );
                setInitialSelectionCompleted(true);
            }

            const selectedSet = new Set(selectedIds);
            setLawyers((previous) =>
                previous.map((item) =>
                    selectedSet.has(item?.lawyer?.public_id)
                        ? { ...item, invite_status: 'pending' }
                        : item,
                ),
            );

            setSelectedIds([]);
            setSuccessModalOpen(true);
        } catch (requestError) {
            setError(
                requestError?.validationMessages?.[0] ||
                    requestError?.message ||
                    'ارسال درخواست انجام نشد.',
            );
        } finally {
            setSending(false);
        }
    };

    const goBack = () => {
        if (additionalMode && legalRequestId) {
            router.push(
                `/client/cases/${encodeURIComponent(
                    legalRequestId,
                )}?type=request`,
            );
            return;
        }

        router.push('/client/cases');
    };

    return (
        <>
            <section dir="rtl" className={`${vazir.className} space-y-4`}>
                <div className="rounded-[18px] border border-[#dfbd6c] bg-white p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="font-extrabold text-[#173f38]">
                                {additionalMode
                                    ? 'دعوت وکیل جدید'
                                    : 'انتخاب وکیل'}
                            </h2>
                            <p className="mt-1 text-sm text-[#74817d]">
                                {additionalMode
                                    ? `می‌توانید تا ${maxSelectable} وکیل دیگر به این درخواست دعوت کنید.`
                                    : 'وکلای متناسب‌تر با درخواست شما در ابتدای لیست قرار می‌گیرند.'}
                            </p>
                        </div>

                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#80908a]"
                            />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="جستجو نام وکیل یا تخصص..."
                                className="w-full rounded-xl border border-[#dfe7e4] bg-[#fbfdfc] py-3 pr-11 pl-4 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-4 border-t border-[#edf1ef] pt-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="ml-1 inline-flex items-center gap-2 text-sm font-extrabold text-[#173f38]">
                                <SlidersHorizontal size={17} />
                                اولویت نمایش
                            </span>

                            {SORT_OPTIONS.map((option) => {
                                const active = activeSorts.includes(
                                    option.key,
                                );

                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() =>
                                            toggleSort(option.key)
                                        }
                                        aria-pressed={active}
                                        className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                                            active
                                                ? 'border-[#123f37] bg-[#123f37] text-white'
                                                : 'border-[#dfe7e4] bg-white text-[#53645f] hover:border-[#9db7b0]'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {!additionalMode && initialSelectionCompleted ? (
                        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
                            <span className="text-sm font-bold text-emerald-800">
                                انتخاب اولیه وکلا برای این درخواست قبلاً انجام
                                شده است. دعوت‌های بعدی را از جزئیات درخواست
                                مدیریت کنید.
                            </span>
                            <button
                                type="button"
                                onClick={goBack}
                                className="rounded-lg bg-[#123f37] px-5 py-2.5 text-sm font-bold text-white"
                            >
                                پرونده‌های من
                            </button>
                        </div>
                    ) : maxSelectable === 0 ? (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-bold text-amber-800">
                            در حال حاضر هر ۵ جایگاه دعوت فعال این درخواست پر
                            است.
                        </div>
                    ) : (
                        <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                            <span className="text-sm font-bold text-[#53645f]">
                                {selectedIds.length} وکیل انتخاب شده؛{' '}
                                {maxSelectable} جایگاه فعال در دسترس است.
                            </span>

                            <button
                                type="button"
                                onClick={submitSelection}
                                disabled={
                                    sending || selectedIds.length === 0
                                }
                                className="rounded-xl bg-[#123f37] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                            >
                                {sending
                                    ? 'در حال ارسال...'
                                    : `ارسال درخواست به ${selectedIds.length} وکیل`}
                            </button>
                        </div>
                    )}

                    {error ? (
                        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                            {error}
                        </div>
                    ) : null}
                </div>

                {loading ? (
                    <div className="rounded-[18px] border bg-white p-10 text-center text-[#7b8783]">
                        در حال دریافت وکلا...
                    </div>
                ) : lawyers.length === 0 ? (
                    <div className="rounded-[18px] border bg-white p-10 text-center text-[#7b8783]">
                        وکیلی پیدا نشد.
                    </div>
                ) : (
                    sortedLawyers.map((item) => {
                        const lawyer = item.lawyer;
                        const publicId = lawyer?.public_id;
                        const selected = selectedIds.includes(publicId);
                        const blockedByHistory =
                            BLOCKED_INVITE_STATUSES.has(
                                item.invite_status,
                            );
                        const disabled =
                            selectionLocked ||
                            blockedByHistory ||
                            (!selected &&
                                selectedIds.length >= maxSelectable);

                        return (
                            <LawyerCard
                                key={publicId}
                                lawyer={lawyer}
                                selectable
                                selected={selected}
                                selectionStatus={item.invite_status}
                                selectionDisabled={disabled}
                                onSelect={() =>
                                    toggleLawyer(
                                        publicId,
                                        item.invite_status,
                                    )
                                }
                                onProfileClick={() =>
                                    router.push(
                                        `/client/lawyersAdmin/${publicId}`,
                                    )
                                }
                            />
                        );
                    })
                )}
            </section>

            {successModalOpen ? (
                <div
                    dir="rtl"
                    className={`${vazir.className} fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]`}
                >
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setSuccessModalOpen(false)}
                            className="absolute left-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            aria-label="بستن"
                        >
                            <X size={20} />
                        </button>

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={30} />
                        </div>

                        <h3 className="mt-5 text-xl font-black text-[#173f38]">
                            درخواست‌ها ارسال شدند
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#687772]">
                            {additionalMode
                                ? 'وکلای جدید به این درخواست دعوت شدند. وضعیت پاسخ آن‌ها را از صفحه جزئیات درخواست می‌توانید دنبال کنید.'
                                : 'درخواست شما برای وکلای انتخاب‌شده ارسال شد. انتخاب اولیه این درخواست تکمیل شده است.'}
                        </p>

                        <button
                            type="button"
                            onClick={goBack}
                            className="mt-6 w-full rounded-xl bg-[#123f37] px-5 py-3 font-bold text-white transition hover:bg-[#0d302a]"
                        >
                            {additionalMode
                                ? 'بازگشت به جزئیات درخواست'
                                : 'رفتن به پرونده‌های من'}
                        </button>
                    </div>
                </div>
            ) : null}
        </>
    );
}
