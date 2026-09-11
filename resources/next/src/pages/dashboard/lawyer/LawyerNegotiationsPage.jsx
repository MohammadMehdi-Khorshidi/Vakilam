'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Scale } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { getLawyerNegotiations } from '@/lib/api/lawyer';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const statusLabels = {
    active: 'مذاکره فعال',
    proposal_submitted: 'پیشنهاد ارسال شده',
    closed: 'بسته شده',
    cancelled: 'لغو شده',
    won: 'توافق نهایی',
};

export default function LawyerNegotiationsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const response = await getLawyerNegotiations({
                    per_page: 50,
                });
                if (mounted) setItems(response?.data ?? []);
            } catch (requestError) {
                if (mounted) {
                    setError(
                        requestError?.message ||
                            'دریافت مذاکرات با خطا مواجه شد.',
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f6f8f5] px-4 py-8 sm:px-6 lg:px-8 xl:px-10`}
        >
            <div className="mx-auto max-w-[1300px]">
                <header className="mb-6">
                    <p className="text-sm font-bold text-[#a47b2c]">
                        پنل وکیل
                    </p>
                    <h1 className="mt-2 text-2xl font-black text-[#123e35] md:text-3xl">
                        مذاکرات
                    </h1>
                    <p className="mt-2 text-sm text-[#75847f]">
                        گفتگوهای فعال و سابقه مذاکرات مربوط به درخواست‌های
                        حقوقی.
                    </p>
                </header>

                {error ? (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="rounded-2xl border bg-white p-12 text-center text-[#81908b]">
                        در حال دریافت مذاکرات...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-12 text-center text-[#81908b]">
                        هنوز مذاکره‌ای ندارید.
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {items.map((item) => (
                            <article
                                key={item.public_id}
                                className="rounded-[20px] border border-[#dde5e1] bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="rounded-full bg-[#edf5f2] px-3 py-1 text-xs font-bold text-[#315f54]">
                                            {statusLabels[item.status] ||
                                                item.status}
                                        </span>
                                        <h2 className="mt-4 font-black text-[#173f38]">
                                            {item.legal_request?.title ||
                                                'درخواست حقوقی'}
                                        </h2>
                                    </div>
                                    <MessageCircle
                                        size={22}
                                        className="text-[#35685c]"
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#7e8d88]">
                                    <span className="inline-flex items-center gap-1">
                                        <Scale size={14} />
                                        {item.legal_request?.status ||
                                            'submitted'}
                                    </span>
                                    {item.proposal ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Send size={14} />
                                            پیشنهاد: {item.proposal.status}
                                        </span>
                                    ) : null}
                                </div>

                                <Link
                                    href={`/lawyer/negotiation/${encodeURIComponent(
                                        item.public_id,
                                    )}`}
                                    className="mt-5 inline-flex rounded-xl bg-[#14594b] px-5 py-3 text-sm font-bold text-white"
                                >
                                    ورود به گفت‌وگو
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
