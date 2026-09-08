'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import LawyerCard from '@/components/carts/LawyerCard';
import {
    getLawyerMatching,
    runLawyerMatching,
    sendLawyerRequests,
} from '@/lib/api/legalRequests';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const SELECTION_LIMIT = 5;

function candidateSearchText(candidate) {
    const lawyer = candidate?.lawyer ?? {};
    const specialtyNames = (lawyer.specialties ?? [])
        .map((item) => item?.specialty?.name || item?.name || '')
        .join(' ');

    const locationNames = (lawyer.service_areas ?? [])
        .map((area) => `${area?.province?.name || ''} ${area?.city?.name || ''}`)
        .join(' ');

    return [
        lawyer.full_name,
        lawyer.bio,
        specialtyNames,
        locationNames,
    ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('fa');
}

export default function LawyersList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const legalRequestId = searchParams.get('legal_request_id');

    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMeta, setSelectionMeta] = useState({
        limit: SELECTION_LIMIT,
        selected_count: 0,
        remaining_count: SELECTION_LIMIT,
    });
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let mounted = true;

        async function loadMatchingLawyers() {
            if (!legalRequestId) {
                if (mounted) {
                    setCandidates([]);
                    setLoading(false);
                    setError('شناسه درخواست حقوقی برای انتخاب وکیل مشخص نیست.');
                }
                return;
            }

            setLoading(true);
            setError('');

            try {
                const firstResponse = await runLawyerMatching(legalRequestId, {
                    page: 1,
                });

                if (!mounted) return;

                const firstCandidates = firstResponse?.data?.candidates ?? [];
                const lastPage =
                    Number(firstResponse?.meta?.pagination?.last_page) || 1;

                let allCandidates = [...firstCandidates];

                for (let page = 2; page <= lastPage; page += 1) {
                    const response = await getLawyerMatching(legalRequestId, {
                        page,
                    });

                    if (!mounted) return;

                    allCandidates = [
                        ...allCandidates,
                        ...(response?.data?.candidates ?? []),
                    ];
                }

                allCandidates.sort(
                    (first, second) =>
                        Number(first?.rank ?? Number.MAX_SAFE_INTEGER) -
                        Number(second?.rank ?? Number.MAX_SAFE_INTEGER),
                );

                setCandidates(allCandidates);
                setSelectionMeta(
                    firstResponse?.meta?.selection ?? {
                        limit: SELECTION_LIMIT,
                        selected_count: 0,
                        remaining_count: SELECTION_LIMIT,
                    },
                );
            } catch (requestError) {
                if (mounted) {
                    setError(
                        requestError?.message ||
                            'دریافت وکلای پیشنهادی با خطا مواجه شد.',
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadMatchingLawyers();

        return () => {
            mounted = false;
        };
    }, [legalRequestId]);

    const filteredCandidates = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase('fa');

        if (!normalizedQuery) return candidates;

        return candidates.filter((candidate) =>
            candidateSearchText(candidate).includes(normalizedQuery),
        );
    }, [candidates, query]);

    const maxSelectable = Math.max(
        0,
        Number(selectionMeta?.remaining_count ?? SELECTION_LIMIT),
    );

    const toggleLawyer = (publicId) => {
        setError('');
        setMessage('');

        setSelectedIds((previous) => {
            if (previous.includes(publicId)) {
                return previous.filter((item) => item !== publicId);
            }

            if (previous.length >= maxSelectable) {
                setError(
                    maxSelectable === 0
                        ? 'برای این درخواست سقف ۵ وکیل فعال تکمیل شده است.'
                        : `در این مرحله حداکثر ${maxSelectable} وکیل دیگر می‌توانید انتخاب کنید.`,
                );
                return previous;
            }

            return [...previous, publicId];
        });
    };

    const submitSelection = async () => {
        if (!legalRequestId || sending || selectedIds.length === 0) return;

        setSending(true);
        setError('');
        setMessage('');

        try {
            const response = await sendLawyerRequests(
                legalRequestId,
                selectedIds,
            );

            const metaSelection =
                response?.meta?.selection ??
                (response?.meta
                    ? {
                          limit: response.meta.selection_limit ?? SELECTION_LIMIT,
                          selected_count: response.meta.selected_count ?? 0,
                          remaining_count:
                              response.meta.remaining_count ?? 0,
                      }
                    : null);

            if (metaSelection) {
                setSelectionMeta(metaSelection);
            }

            setMessage('درخواست برای وکلای انتخاب‌شده ارسال شد.');
            setSelectedIds([]);
        } catch (requestError) {
            setError(
                requestError?.validationMessages?.[0] ||
                    requestError?.message ||
                    'ارسال درخواست برای وکلا انجام نشد.',
            );
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-[18px] border border-[#e2e9e6] bg-white p-10 text-center text-[#7b8783]">
                در حال محاسبه و دریافت وکلای متناسب با درخواست...
            </div>
        );
    }

    return (
        <section dir="rtl" className={`${vazir.className} space-y-4`}>
            <div className="rounded-[18px] border border-[#dfbd6c] bg-white p-5 shadow-[0_5px_20px_rgba(18,63,55,0.04)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-extrabold text-[#173f38]">
                            وکلای متناسب با درخواست شما
                        </h2>
                        <p className="mt-1 text-sm text-[#74817d]">
                            لیست بر اساس امتیاز matching مرتب شده است. حداکثر ۵
                            وکیل می‌توانند هم‌زمان برای این درخواست فعال باشند.
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
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="جستجو نام وکیل، تخصص یا شهر..."
                            className="w-full rounded-xl border border-[#dfe7e4] bg-[#fbfdfc] py-3 pr-11 pl-4 text-sm outline-none transition focus:border-[#8eb7ab]"
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[#edf1ef] pt-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm font-bold text-[#53645f]">
                        {selectionMeta.selected_count || 0} وکیل از قبل فعال —
                        {' '}
                        {selectionMeta.remaining_count ?? SELECTION_LIMIT} جای
                        باقی‌مانده
                    </p>

                    <button
                        type="button"
                        onClick={submitSelection}
                        disabled={sending || selectedIds.length === 0}
                        className="rounded-xl bg-[#123f37] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0d302a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {sending
                            ? 'در حال ارسال...'
                            : `ارسال درخواست به ${selectedIds.length} وکیل`}
                    </button>
                </div>

                {error ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {message ? (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        {message}
                    </div>
                ) : null}
            </div>

            {candidates.length === 0 ? (
                <div className="rounded-[18px] border border-[#e2e9e6] bg-white p-10 text-center">
                    <h3 className="font-extrabold text-[#173f38]">
                        فعلاً وکیل متناسبی پیدا نشد
                    </h3>
                    <p className="mt-2 text-sm text-[#7b8783]">
                        matching برای همین درخواست انجام شد، اما در حال حاضر
                        وکیل تأییدشده، فعال و واجد شرایطی وجود ندارد.
                    </p>
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="rounded-[18px] border border-[#e2e9e6] bg-white p-8 text-center text-sm text-[#7b8783]">
                    نتیجه‌ای برای جستجوی «{query}» پیدا نشد.
                </div>
            ) : (
                filteredCandidates.map((candidate) => {
                    const lawyer = candidate.lawyer;
                    const publicId = lawyer?.public_id;
                    const selected = selectedIds.includes(publicId);
                    const disabled =
                        !selected && selectedIds.length >= maxSelectable;

                    return (
                        <div
                            key={publicId}
                            className={`rounded-[20px] ${
                                selected
                                    ? 'ring-2 ring-[#c79a37] ring-offset-2'
                                    : ''
                            }`}
                        >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <span className="rounded-full bg-[#123f37] px-3 py-1.5 text-white">
                                        رتبه {candidate.rank}
                                    </span>
                                    <span className="rounded-full bg-[#f3ead5] px-3 py-1.5 text-[#7b5c18]">
                                        امتیاز تطبیق {candidate.score}
                                    </span>
                                </div>

                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#dfbd6c] bg-white px-4 py-2 text-sm font-bold text-[#173f38]">
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        disabled={disabled}
                                        onChange={() => toggleLawyer(publicId)}
                                        className="h-4 w-4 accent-[#123f37]"
                                    />
                                    {selected ? 'انتخاب شده' : 'انتخاب وکیل'}
                                </label>
                            </div>

                            <LawyerCard
                                lawyer={lawyer}
                                onProfileClick={() =>
                                    router.push(
                                        `/client/lawyersAdmin/${publicId}`,
                                    )
                                }
                            />
                        </div>
                    );
                })
            )}
        </section>
    );
}
