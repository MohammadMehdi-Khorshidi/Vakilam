'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import LawyerCard from '@/components/carts/LawyerCard';
import {
    listSelectableLawyers,
    runLawyerMatching,
    sendLawyerRequests,
} from '@/lib/api/legalRequests';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const SELECTION_LIMIT = 5;

export default function LawyersList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const legalRequestId = searchParams.get('legal_request_id');

    const [lawyers, setLawyers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMeta, setSelectionMeta] = useState({
        limit: SELECTION_LIMIT,
        selected_count: 0,
        remaining_count: SELECTION_LIMIT,
    });
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

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
                const lastPage = Number(first?.meta?.pagination?.last_page) || 1;

                for (let page = 2; page <= lastPage; page += 1) {
                    const response = await listSelectableLawyers(legalRequestId, {
                        q: debouncedQuery || undefined,
                        per_page: 50,
                        page,
                    });

                    if (!mounted) return;
                    all = [...all, ...(response?.data ?? [])];
                }

                setLawyers(all);
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
                setError('سقف انتخاب وکیل برای این درخواست تکمیل شده است.');
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

            if (response?.meta?.selection) {
                setSelectionMeta(response.meta.selection);
            }

            setSelectedIds([]);
            setMessage('درخواست برای وکلای انتخاب‌شده ارسال شد.');
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

    return (
        <section dir="rtl" className={`${vazir.className} space-y-4`}>
            <div className="rounded-[18px] border border-[#dfbd6c] bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-extrabold text-[#173f38]">
                            انتخاب وکیل
                        </h2>
                        <p className="mt-1 text-sm text-[#74817d]">
                            وکلای متناسب‌تر با درخواست شما در ابتدای لیست قرار می‌گیرند.
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
                            placeholder="جستجو نام وکیل یا تخصص..."
                            className="w-full rounded-xl border border-[#dfe7e4] bg-[#fbfdfc] py-3 pr-11 pl-4 text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                    <span className="text-sm font-bold text-[#53645f]">
                        {selectionMeta.remaining_count ?? SELECTION_LIMIT} جای باقی‌مانده
                    </span>

                    <button
                        type="button"
                        onClick={submitSelection}
                        disabled={sending || selectedIds.length === 0}
                        className="rounded-xl bg-[#123f37] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                        {sending
                            ? 'در حال ارسال...'
                            : `ارسال درخواست به ${selectedIds.length} وکیل`}
                    </button>
                </div>

                {error ? (
                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {message ? (
                    <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        {message}
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
                lawyers.map((item) => {
                    const lawyer = item.lawyer;
                    const publicId = lawyer?.public_id;
                    const selected = selectedIds.includes(publicId);
                    const disabled =
                        !selected && selectedIds.length >= maxSelectable;

                    return (
                        <LawyerCard
                            key={publicId}
                            lawyer={lawyer}
                            selectable
                            selected={selected}
                            selectionDisabled={disabled}
                            onSelect={() => toggleLawyer(publicId)}
                            onProfileClick={() =>
                                router.push(`/client/lawyersAdmin/${publicId}`)
                            }
                        />
                    );
                })
            )}
        </section>
    );
}
