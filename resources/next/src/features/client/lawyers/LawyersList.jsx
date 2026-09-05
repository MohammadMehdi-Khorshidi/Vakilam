'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import LawyerCard from '@/components/carts/LawyerCard';
import { listLawyers } from '@/lib/api/references';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export default function LawyersList() {
    const router = useRouter();
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        listLawyers({ perPage: 30 })
            .then((response) => {
                if (!mounted) return;
                setLawyers(Array.isArray(response) ? response : response?.data || []);
            })
            .catch((requestError) => {
                if (mounted) setError(requestError.message);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="rounded-[18px] border border-[#e2e9e6] bg-white p-10 text-center text-[#7b8783]">
                در حال دریافت فهرست وکلا...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[18px] bg-red-50 p-6 text-center text-red-700">
                {error}
            </div>
        );
    }

    if (lawyers.length === 0) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} rounded-[18px] border border-[#e2e9e6] bg-white p-10 text-center`}
            >
                <h3 className="font-extrabold text-[#173f38]">وکیلی پیدا نشد</h3>
                <p className="mt-2 text-sm text-[#7b8783]">
                    در حال حاضر وکیل تأییدشده و فعالی برای نمایش وجود ندارد.
                </p>
            </div>
        );
    }

    return (
        <section dir="rtl" className={`${vazir.className} space-y-4`}>
            {lawyers.map((lawyer) => (
                <LawyerCard
                    key={lawyer.public_id}
                    lawyer={lawyer}
                    onProfileClick={() =>
                        router.push(
                            `/client/lawyersAdmin/${lawyer.public_id}`,
                        )
                    }
                />
            ))}
        </section>
    );
}
