'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CalendarClock,
    Check,
    Clock3,
    Search,
    SlidersHorizontal,
    Star,
    X,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import {
    createConsultationHold,
    getConsultationDirectory,
    getConsultationSlots,
} from '@/lib/api/consultations';
import {
    formatPersianDate,
    formatTime24,
} from '@/lib/persianDateTime';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const DURATIONS = [15, 30, 45, 60];
const fa = new Intl.NumberFormat('fa-IR');

const SORT_OPTIONS = [
    { key: 'topic', label: 'ارتباط با موضوع' },
    { key: 'location', label: 'نزدیکی موقعیت' },
    { key: 'experience', label: 'سابقه بیشتر' },
    { key: 'rating', label: 'امتیاز بالاتر کاربران' },
];

const DEFAULT_SORTS = ['topic', 'location'];

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

function dayKey(value) {
    return new Date(value).toISOString().slice(0, 10);
}

export default function ConsultationBookingPage() {
    const params = useSearchParams();
    const router = useRouter();
    const requestId = params.get('legal_request_id');

    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeSorts, setActiveSorts] = useState(DEFAULT_SORTS);
    const [onlyFree, setOnlyFree] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selected, setSelected] = useState(null);
    const [duration, setDuration] = useState(30);
    const [slots, setSlots] = useState([]);
    const [slotMeta, setSlotMeta] = useState({});
    const [slotLoading, setSlotLoading] = useState(false);
    const [chosen, setChosen] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 300);
        return () => window.clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        let mounted = true;

        async function loadLawyers() {
            if (!requestId) {
                if (mounted) {
                    setError('شناسه درخواست مشاوره مشخص نیست.');
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError('');

            try {
                const first = await getConsultationDirectory(requestId, {
                    q: debouncedQuery || undefined,
                    has_availability: onlyFree ? 1 : undefined,
                    per_page: 50,
                    page: 1,
                });

                if (!mounted) return;

                let all = [...(first?.data ?? [])];
                const lastPage = Number(first?.meta?.last_page) || 1;

                for (let page = 2; page <= lastPage; page += 1) {
                    const response = await getConsultationDirectory(requestId, {
                        q: debouncedQuery || undefined,
                        has_availability: onlyFree ? 1 : undefined,
                        per_page: 50,
                        page,
                    });
                    if (!mounted) return;
                    all = [...all, ...(response?.data ?? [])];
                }

                setItems(all);
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
    }, [requestId, debouncedQuery, onlyFree]);

    const toggleSort = (key) => {
        setActiveSorts((previous) =>
            previous.includes(key)
                ? previous.filter((item) => item !== key)
                : [...previous, key],
        );
    };

    const sortedItems = useMemo(() => {
        if (activeSorts.length === 0) return items;

        return items
            .map((item, index) => ({ item, index }))
            .sort((first, second) => {
                const difference =
                    priorityScore(second.item, activeSorts) -
                    priorityScore(first.item, activeSorts);
                return difference || first.index - second.index;
            })
            .map(({ item }) => item);
    }, [items, activeSorts]);

    async function loadSlots(item, nextDuration = duration) {
        setSlotLoading(true);
        setChosen(null);
        setError('');

        try {
            const response = await getConsultationSlots(
                requestId,
                item.lawyer.public_id,
                nextDuration,
            );
            setSlots(response?.data ?? []);
            setSlotMeta(response?.meta ?? {});
        } catch (requestError) {
            setSlots([]);
            setSlotMeta({});
            setError(
                requestError?.message ||
                    'دریافت زمان‌های آزاد انجام نشد.',
            );
        } finally {
            setSlotLoading(false);
        }
    }

    function open(item) {
        setError('');
        setSelected(item);
        setDuration(30);
        setSlots([]);
        setChosen(null);
        loadSlots(item, 30);
    }

    async function changeDuration(nextDuration) {
        setDuration(nextDuration);
        await loadSlots(selected, nextDuration);
    }

    const grouped = useMemo(() => {
        const map = new Map();
        slots.forEach((slot) => {
            const key = dayKey(slot.starts_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(slot);
        });
        return [...map.entries()];
    }, [slots]);

    async function continueReview() {
        if (!chosen || !selected || busy) return;

        setBusy(true);
        setError('');

        try {
            const hold = await createConsultationHold(requestId, {
                lawyer_public_id: selected.lawyer.public_id,
                starts_at: chosen.starts_at,
                duration_minutes: duration,
            });

            router.push(
                `/client/consultations/review?consultation_id=${encodeURIComponent(
                    hold.public_id,
                )}`,
            );
        } catch (requestError) {
            setError(
                requestError?.message ||
                    'نگه‌داری موقت زمان انجام نشد.',
            );
            await loadSlots(selected, duration);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main
            dir="rtl"
            className={`${vazir.className} mt-12 min-h-screen bg-[#f7faf8] px-5 py-10 sm:px-8`}
        >
            <div className="mx-auto max-w-[1200px]">
                <section className="mb-6 mt-2">
                    <h1 className="text-right text-2xl font-bold tracking-tight text-[#123f37]">
                        همه وکلا؛ مرتبط‌ترین‌ها ابتدا
                    </h1>
                    <p className="mt-3 max-w-3xl text-right leading-7 text-[#71817c]">
                        وکیل موردنظر را بررسی کنید و قبل از انتخاب نهایی،
                        تعرفه و زمان‌های آزاد واقعی او را ببینید.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="rounded-[18px] border border-[#dfbd6c] bg-white p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="font-extrabold text-[#173f38]">
                                    انتخاب وکیل برای مشاوره
                                </h2>
                                <p className="mt-1 text-sm text-[#74817d]">
                                    اولویت نمایش را مثل بخش انتخاب وکیل تنظیم کنید.
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
                                    className="w-full rounded-xl border border-[#dfe7e4] bg-[#fbfdfc] py-3 pr-11 pl-4 text-sm outline-none focus:border-[#9db7b0]"
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

                                <label
                                    className={`mr-1 inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                                        onlyFree
                                            ? 'border-[#c49a45] bg-[#fff8e7] text-[#70561e]'
                                            : 'border-[#dfe7e4] bg-white text-[#53645f] hover:border-[#c8ad72]'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={onlyFree}
                                        onChange={(event) =>
                                            setOnlyFree(event.target.checked)
                                        }
                                        className="accent-[#123f37]"
                                    />
                                    فقط دارای زمان آزاد
                                </label>
                            </div>
                        </div>

                        {error ? (
                            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                {error}
                            </div>
                        ) : null}
                    </div>

                    {loading ? (
                        <div className="rounded-[18px] border border-[#dfe7e3] bg-white p-10 text-center text-[#7b8783]">
                            در حال دریافت وکلا...
                        </div>
                    ) : sortedItems.length === 0 ? (
                        <div className="rounded-[18px] border border-[#dfe7e3] bg-white p-10 text-center text-[#7b8783]">
                            وکیلی با این فیلتر پیدا نشد.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {sortedItems.map((item) => {
                                const lawyer = item.lawyer;
                                return (
                                    <article
                                        key={lawyer.public_id}
                                        className="rounded-[18px] border border-[#dfe7e3] bg-white p-5 transition hover:border-[#cdb878]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-black text-[#173f38]">
                                                    {lawyer.full_name ||
                                                        'وکیل'}
                                                </h2>
                                                <p className="mt-1 text-xs text-[#74817d]">
                                                    {item.years_experience
                                                        ? `${fa.format(
                                                              item.years_experience,
                                                          )} سال سابقه مرتبط`
                                                        : 'سابقه ثبت نشده'}
                                                </p>
                                            </div>

                                            {lawyer.average_rating ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8e7] px-2.5 py-1 text-xs font-bold text-[#8a6925]">
                                                    <Star size={13} />
                                                    {lawyer.average_rating}
                                                </span>
                                            ) : null}
                                        </div>

                                        {lawyer.specialties?.length ? (
                                            <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#71817c]">
                                                {lawyer.specialties
                                                    .map((item) => item.name)
                                                    .filter(Boolean)
                                                    .join('، ')}
                                            </p>
                                        ) : null}

                                        <div className="mt-4 rounded-xl bg-[#f7faf8] p-3 text-xs leading-6 text-[#60726d]">
                                            <p>
                                                {item.nearest_available_at ? (
                                                    <>
                                                        نزدیک‌ترین زمان:{' '}
                                                        <b>
                                                            {formatPersianDate(
                                                                item.nearest_available_at,
                                                            )}{' '}
                                                            ساعت{' '}
                                                            {formatTime24(
                                                                item.nearest_available_at,
                                                            )}
                                                        </b>
                                                    </>
                                                ) : (
                                                    'زمان آزاد ثبت نشده'
                                                )}
                                            </p>
                                            <p>
                                                {item.min_price_rial ? (
                                                    <>
                                                        شروع تعرفه از{' '}
                                                        <b>
                                                            {fa.format(
                                                                Math.round(
                                                                    item.min_price_rial /
                                                                        10,
                                                                ),
                                                            )}{' '}
                                                            تومان
                                                        </b>
                                                    </>
                                                ) : (
                                                    'تعرفه مشاوره ثبت نشده'
                                                )}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => open(item)}
                                            className="mt-4 w-full rounded-xl bg-[#123f37] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0d332c]"
                                        >
                                            رزرو مشاوره
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {selected ? (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[22px] bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#a47b2c]">
                                    رزرو مشاوره
                                </p>
                                <h2 className="mt-1 text-xl font-black text-[#173f38]">
                                    {selected.lawyer.full_name}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="mt-5 text-xs font-bold text-[#53645f]">
                            مدت مشاوره
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {DURATIONS.map((item) => {
                                const price =
                                    selected.rates?.[String(item)];
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        disabled={!price}
                                        onClick={() =>
                                            changeDuration(item)
                                        }
                                        className={`rounded-xl border px-2 py-3 text-xs font-black disabled:cursor-not-allowed disabled:opacity-35 ${
                                            duration === item
                                                ? 'border-[#c7a154] bg-[#fff8e7] text-[#6e541d]'
                                                : 'border-[#dfe7e4] text-[#53645f]'
                                        }`}
                                    >
                                        <span className="block">
                                            {item} دقیقه
                                        </span>
                                        <span className="mt-1 block text-[10px]">
                                            {price
                                                ? `${fa.format(
                                                      Math.round(price / 10),
                                                  )} تومان`
                                                : 'بدون تعرفه'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 rounded-xl bg-[#f7faf8] p-4">
                            <p className="text-sm font-black text-[#294e46]">
                                هزینه این مشاوره:{' '}
                                {slotMeta?.price_rial
                                    ? `${fa.format(
                                          Math.round(
                                              slotMeta.price_rial / 10,
                                          ),
                                      )} تومان`
                                    : 'تعرفه ثبت نشده'}
                            </p>
                            <p className="mt-1 text-xs text-[#71817c]">
                                فقط زمان‌هایی نمایش داده می‌شوند که حداقل ۶۰
                                دقیقه تا شروع آن‌ها باقی مانده باشد.
                            </p>
                        </div>

                        <div className="mt-5">
                            {slotLoading ? (
                                <div className="rounded-xl bg-[#f7faf8] p-10 text-center text-sm text-[#71817c]">
                                    در حال دریافت زمان‌ها...
                                </div>
                            ) : grouped.length === 0 ? (
                                <div className="rounded-xl bg-[#f7faf8] p-10 text-center text-sm text-[#71817c]">
                                    برای این مدت زمان آزادی در ۳۰ روز آینده
                                    وجود ندارد.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {grouped.map(([key, list]) => (
                                        <section
                                            key={key}
                                            className="rounded-2xl border border-[#dfe7e3] p-4"
                                        >
                                            <div className="flex items-center gap-2 font-black text-[#294e46]">
                                                <CalendarClock size={17} />
                                                {formatPersianDate(
                                                    list[0].starts_at,
                                                )}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {list.map((slot) => {
                                                    const active =
                                                        chosen?.starts_at ===
                                                        slot.starts_at;
                                                    return (
                                                        <button
                                                            key={
                                                                slot.starts_at
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                setChosen(
                                                                    slot,
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-black ${
                                                                active
                                                                    ? 'border-[#17634f] bg-[#edf7f3] text-[#17634f]'
                                                                    : 'border-[#dfe7e4] text-[#53645f] hover:border-[#9db7b0]'
                                                            }`}
                                                        >
                                                            {active ? (
                                                                <Check
                                                                    size={13}
                                                                />
                                                            ) : (
                                                                <Clock3
                                                                    size={13}
                                                                />
                                                            )}
                                                            {formatTime24(
                                                                slot.starts_at,
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}
                        </div>

                        {chosen ? (
                            <div className="mt-5 rounded-2xl border border-[#cfe4dc] bg-[#eff8f4] p-4">
                                <p className="font-black text-[#17634f]">
                                    زمان انتخاب‌شده:{' '}
                                    {formatPersianDate(chosen.starts_at)} ساعت{' '}
                                    {formatTime24(chosen.starts_at)}
                                </p>
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={continueReview}
                                    className="mt-3 w-full rounded-xl bg-[#123f37] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0d332c] disabled:opacity-50"
                                >
                                    {busy
                                        ? 'در حال ثبت...'
                                        : 'ادامه و مشاهده جزئیات'}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </main>
    );
}
