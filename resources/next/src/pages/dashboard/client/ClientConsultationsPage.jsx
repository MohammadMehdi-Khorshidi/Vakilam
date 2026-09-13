'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    CalendarClock,
    Clock3,
    FilePlus2,
    Hourglass,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { getClientConsultations } from '@/lib/api/consultations';
import {
    formatPersianDate,
    formatTime24,
} from '@/lib/persianDateTime';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const statusLabel = {
    held: 'در انتظار پرداخت',
    reserved: 'رزرو شده',
    confirmed: 'تأیید شده',
    completed: 'برگزار شده',
    cancelled: 'لغو شده',
    expired: 'منقضی شده',
    no_show: 'عدم حضور',
};

const fa = new Intl.NumberFormat('fa-IR');

export default function ClientConsultationsPage() {
    const [data, setData] = useState({
        requests: [],
        consultations: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getClientConsultations()
            .then((response) =>
                setData(
                    response ?? {
                        requests: [],
                        consultations: [],
                    },
                ),
            )
            .catch((requestError) =>
                setError(
                    requestError?.message ||
                        'دریافت مشاوره‌ها انجام نشد.',
                ),
            )
            .finally(() => setLoading(false));
    }, []);

    const byRequest = useMemo(
        () =>
            new Map(
                (data.consultations || []).map((item) => [
                    item.legal_request?.public_id,
                    item,
                ]),
            ),
        [data],
    );

    const activeCount = (data.consultations || []).filter((item) =>
        ['held', 'reserved', 'confirmed'].includes(item.status),
    ).length;

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f7faf8]`}
        >
            <div className="mx-auto mt-12 max-w-[1280px] px-5 py-7">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#173f38]">
                            مشاوره‌های من
                        </h1>
                        <p className="mt-2 text-sm leading-7 text-[#71817c]">
                            درخواست‌های مشاوره، رزروها و پرداخت‌ها را جدا از
                            پرونده‌های وکالتی از همین بخش پیگیری کنید.
                        </p>
                    </div>

                    <Link
                        href="/client/legal-request"
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 font-bold text-white transition hover:bg-[#0d332c]"
                    >
                        <FilePlus2 size={18} />
                        درخواست مشاوره جدید
                    </Link>
                </header>

                {error ? (
                    <div className="rounded-[18px] border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="rounded-[18px] border border-[#dfe7e3] bg-white py-16 text-center text-[#899691]">
                        در حال دریافت مشاوره‌ها...
                    </div>
                ) : (
                    <div className="space-y-5">
                        <section className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-center justify-between rounded-[18px] border border-[#d6e7e0] bg-[#eff8f4] p-5">
                                <div>
                                    <p className="text-xs font-bold text-[#648078]">
                                        مشاوره‌های فعال
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-[#173f38]">
                                        {fa.format(activeCount)}
                                    </p>
                                </div>
                                <CalendarClock className="text-[#174f43]" />
                            </div>

                            <div className="flex items-center justify-between rounded-[18px] border border-[#eadfbe] bg-[#fffaf0] p-5">
                                <div>
                                    <p className="text-xs font-bold text-[#8b7440]">
                                        درخواست‌های مشاوره
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-[#5d4c27]">
                                        {fa.format(
                                            (data.requests || []).length,
                                        )}
                                    </p>
                                </div>
                                <Hourglass className="text-[#b38b38]" />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
                            <div className="border-b border-[#e8eeeb] px-5 py-5">
                                <h2 className="font-extrabold text-[#173f38]">
                                    درخواست‌های مشاوره
                                </h2>
                                <p className="mt-1 text-xs leading-6 text-[#7e8d88]">
                                    درخواست‌هایی که هنوز در مسیر انتخاب زمان،
                                    مرور یا پرداخت هستند.
                                </p>
                            </div>

                            {!(data.requests || []).length ? (
                                <p className="px-5 py-10 text-center text-sm text-[#899691]">
                                    درخواست مشاوره‌ای ندارید.
                                </p>
                            ) : (
                                <div className="divide-y divide-[#e8eeeb]">
                                    {data.requests.map((request) => {
                                        const consultation = byRequest.get(
                                            request.public_id,
                                        );

                                        return (
                                            <article
                                                key={request.public_id}
                                                className="flex flex-col justify-between gap-4 px-5 py-5 lg:flex-row lg:items-center"
                                            >
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-extrabold text-[#294e46]">
                                                            {request.title ||
                                                                'مشاوره حقوقی'}
                                                        </h3>
                                                        <span className="rounded-full border border-[#cfe4dc] bg-[#eff8f4] px-3 py-1 text-xs font-bold text-[#17634f]">
                                                            درخواست مشاوره
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-xs text-[#7f8e89]">
                                                        {request
                                                            .legal_category
                                                            ?.name ||
                                                            'موضوع حقوقی'}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">

                                                    {consultation?.status ===
                                                    'held' ? (
                                                        <Link
                                                            href={`/client/consultations/review?consultation_id=${encodeURIComponent(
                                                                consultation.public_id,
                                                            )}`}
                                                            className="rounded-xl bg-[#123f37] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0d332c]"
                                                        >
                                                            ادامه رزرو و پرداخت
                                                        </Link>
                                                    ) : !consultation ||
                                                      [
                                                          'cancelled',
                                                          'expired',
                                                      ].includes(
                                                          consultation.status,
                                                      ) ? (
                                                        <Link
                                                            href={`/client/consultation-booking?legal_request_id=${encodeURIComponent(
                                                                request.id,
                                                            )}`}
                                                            className="rounded-xl bg-[#123f37] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0d332c]"
                                                        >
                                                            انتخاب وکیل و رزرو
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
                            <div className="border-b border-[#e8eeeb] px-5 py-5">
                                <h2 className="font-extrabold text-[#173f38]">
                                    رزروها و سوابق
                                </h2>
                            </div>

                            {!(data.consultations || []).length ? (
                                <p className="px-5 py-10 text-center text-sm text-[#899691]">
                                    هنوز زمانی انتخاب نکرده‌اید.
                                </p>
                            ) : (
                                <div className="divide-y divide-[#e8eeeb]">
                                    {data.consultations.map((item) => (
                                        <article
                                            key={item.public_id}
                                            className="px-5 py-5"
                                        >
                                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                                <div>
                                                    <h3 className="font-extrabold text-[#294e46]">
                                                        {item.legal_request
                                                            ?.title ||
                                                            'مشاوره حقوقی'}
                                                    </h3>
                                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#7f8e89]">
                                                        <span>
                                                            وکیل:{' '}
                                                            <b className="text-[#52655f]">
                                                                {item.lawyer
                                                                    ?.full_name ||
                                                                    '—'}
                                                            </b>
                                                        </span>
                                                        <span>
                                                            <Clock3
                                                                size={14}
                                                                className="ml-1 inline"
                                                            />
                                                            {formatPersianDate(
                                                                item.scheduled_start_at,
                                                            )}{' '}
                                                            ساعت{' '}
                                                            {formatTime24(
                                                                item.scheduled_start_at,
                                                            )}
                                                        </span>
                                                        <span>
                                                            {
                                                                item.duration_minutes
                                                            }{' '}
                                                            دقیقه
                                                        </span>
                                                        {item.price_rial ? (
                                                            <span>
                                                                {fa.format(
                                                                    Math.round(
                                                                        item.price_rial /
                                                                            10,
                                                                    ),
                                                                )}{' '}
                                                                تومان
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <span className="w-fit rounded-full border border-[#cfe4dc] bg-[#eff8f4] px-3 py-1.5 text-xs font-bold text-[#17634f]">
                                                    {statusLabel[item.status] ||
                                                        'در حال پیگیری'}
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}
