// 'use client';
//
// import { useMemo, useState } from 'react';
//
//
// import { lawyers } from './(lawyers)/lawyersData';
// import LawyersHeader from '@/components/pages/dashboard/admin/(lawyersAdmin)/LawyersHeader';
// import LawyersFilters from '@/components/pages/dashboard/admin/(lawyersAdmin)/LawyersFilters';
// import LawyersTable from '@/components/pages/dashboard/admin/(lawyersAdmin)/LawyersTable';
//
// export default function LawyersPage() {
//     const [activeFilter, setActiveFilter] = useState('all');
//
//     const filteredLawyers = useMemo(() => {
//         if (activeFilter === 'all') {
//             return lawyers;
//         }
//
//         return lawyers.filter(
//             (lawyer) => lawyer.verificationStatus === activeFilter,
//         );
//     }, [activeFilter]);
//
//     return (
//         <div className="mx-auto w-full max-w-[1500px]">
//             <LawyersHeader />
//
//             <LawyersFilters
//                 activeFilter={activeFilter}
//                 onFilterChange={setActiveFilter}
//             />
//
//             <LawyersTable lawyers={filteredLawyers} />
//         </div>
//     );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';

 import LawyersHeader from '../../../features/admin/lawyers/LawyersHeader';
 import LawyersTable from '../../../features/admin/lawyers/LawyersTable';
import LawyersFilters from '../../../features/admin/lawyers/LawyersFilters';

const API_URL = 'http://127.0.0.1:8000/api/lawyers';

export default function LawyersPage() {
    const [lawyers, setLawyers] = useState([]);

    const [activeFilter, setActiveFilter] = useState('all');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // =====================================================
    // دریافت وکلا از API
    // =====================================================

    useEffect(() => {
        const getLawyers = async () => {
            try {
                setLoading(true);
                setError('');

                const token = localStorage.getItem('auth_token');

                const headers = {
                    Accept: 'application/json',
                };

                // اگر کاربر لاگین باشد
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers,
                });

                const result = await response.json();

                console.log('Lawyers API Response:', result);

                // =================================================
                // خطای احراز هویت
                // =================================================

                if (response.status === 401) {
                    setError('دسترسی شما برای مشاهده لیست وکلا مجاز نیست.');

                    return;
                }

                // =================================================
                // سایر خطاها
                // =================================================

                if (!response.ok) {
                    setError(
                        result.message || 'دریافت لیست وکلا با خطا مواجه شد.',
                    );

                    return;
                }

                // =================================================
                // گرفتن data
                // =================================================

                let lawyersData = [];

                if (Array.isArray(result.data)) {
                    lawyersData = result.data;
                } else if (Array.isArray(result)) {
                    lawyersData = result;
                } else if (Array.isArray(result.lawyers)) {
                    lawyersData = result.lawyers;
                } else if (Array.isArray(result.data?.data)) {
                    lawyersData = result.data.data;
                }

                // =================================================
                // تبدیل اطلاعات API برای UI
                // =================================================

                const formattedLawyers = lawyersData.map((lawyer) => {
                    return {
                        ...lawyer,

                        id: lawyer.id ?? lawyer.lawyer_id ?? lawyer.user_id,

                        name:
                            lawyer.name ??
                            lawyer.full_name ??
                            lawyer.user?.name ??
                            lawyer.user?.full_name ??
                            'بدون نام',

                        firstName:
                            lawyer.first_name ?? lawyer.user?.first_name ?? '',

                        lastName:
                            lawyer.last_name ?? lawyer.user?.last_name ?? '',

                        phone:
                            lawyer.phone ??
                            lawyer.mobile ??
                            lawyer.user?.phone ??
                            lawyer.user?.mobile ??
                            '-',

                        email: lawyer.email ?? lawyer.user?.email ?? '-',

                        nationalCode:
                            lawyer.national_code ??
                            lawyer.nationalCode ??
                            lawyer.user?.national_code ??
                            '-',

                        barNumber:
                            lawyer.bar_number ??
                            lawyer.barNumber ??
                            lawyer.license_number ??
                            lawyer.licenseNumber ??
                            '-',

                        specialization:
                            lawyer.specialization ??
                            lawyer.specialty ??
                            lawyer.field ??
                            lawyer.practice_area ??
                            '-',

                        city:
                            lawyer.city ??
                            lawyer.city_name ??
                            lawyer.user?.city ??
                            '-',

                        province:
                            lawyer.province ?? lawyer.province_name ?? '-',

                        verificationStatus:
                            lawyer.verification_status ??
                            lawyer.verificationStatus ??
                            lawyer.status ??
                            'pending',
                    };
                });

                console.log('Formatted Lawyers:', formattedLawyers);

                setLawyers(formattedLawyers);
            } catch (error) {
                console.error('Lawyers API Error:', error);

                setError('ارتباط با سرور برقرار نشد.');
            } finally {
                setLoading(false);
            }
        };

        getLawyers();
    }, []);

    // =====================================================
    // فیلتر وکلا
    // =====================================================

    const filteredLawyers = useMemo(() => {
        if (activeFilter === 'all') {
            return lawyers;
        }

        return lawyers.filter(
            (lawyer) => lawyer.verificationStatus === activeFilter,
        );
    }, [lawyers, activeFilter]);

    // =====================================================
    // Loading
    // =====================================================

    if (loading) {
        return (
            <div
                dir="rtl"
                className="mx-auto flex min-h-[500px] w-full max-w-[1500px] items-center justify-center"
            >
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dfe8e4] border-t-[#123f37]" />

                    <p className="mt-4 text-sm font-semibold text-[#123f37]">
                        در حال دریافت لیست وکلا...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // Error
    // =====================================================

    if (error) {
        return (
            <div
                dir="rtl"
                className="mx-auto flex min-h-[500px] w-full max-w-[1500px] items-center justify-center px-5"
            >
                <div className="w-full max-w-[500px] rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-500">
                        !
                    </div>

                    <h2 className="mt-4 text-lg font-extrabold text-[#123f37]">
                        خطا در دریافت اطلاعات
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-xl bg-[#123f37] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1c554a]"
                    >
                        تلاش مجدد
                    </button>
                </div>
            </div>
        );
    }

    // =====================================================
    // Page
    // =====================================================

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px]">
            {/* Header */}

            <LawyersHeader />

            {/* Filters */}

            <LawyersFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* Table */}

            {filteredLawyers.length > 0 ? (
                <LawyersTable lawyers={filteredLawyers} />
            ) : (
                <div className="mt-5 rounded-2xl border border-[#e0e8e5] bg-white p-10 text-center">
                    <p className="text-sm font-semibold text-[#52635f]">
                        {lawyers.length === 0
                            ? 'هیچ وکیلی برای نمایش وجود ندارد.'
                            : 'وکیلی با این وضعیت پیدا نشد.'}
                    </p>
                </div>
            )}
        </div>
    );
}
