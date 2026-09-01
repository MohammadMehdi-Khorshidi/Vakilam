'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import ProfileHeader from '../../dashboard/lawyer/profile/ProfileHeader';
import ProfileInfo from '../../dashboard/lawyer/profile/ProfileInfo';
import ProfileStats from '../../dashboard/lawyer/profile/ProfileStats';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const API_URL = 'http://127.0.0.1:8000/api';

export default function LawyerProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [serviceAreas, setServiceAreas] = useState([]);

    const [loading, setLoading] = useState(true);
    const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
    const [serviceAreasLoading, setServiceAreasLoading] = useState(true);

    const [error, setError] = useState('');
    const [specialtiesError, setSpecialtiesError] = useState('');
    const [serviceAreasError, setServiceAreasError] = useState('');

    // =========================
    // دریافت اطلاعات پروفایل
    // =========================

    useEffect(() => {
        const getProfile = async () => {
            try {
                setLoading(true);
                setError('');

                const token = localStorage.getItem('auth_token');

                if (!token) {
                    setError(
                        'برای مشاهده پروفایل ابتدا وارد حساب کاربری خود شوید.',
                    );

                    return;
                }

                const response = await fetch(`${API_URL}/lawyer/profile`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                console.log('Lawyer Profile API Response:', result);

                if (response.status === 401) {
                    localStorage.removeItem('auth_token');

                    setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');

                    return;
                }

                if (!response.ok) {
                    setError(
                        result.message ||
                            'دریافت اطلاعات پروفایل با خطا مواجه شد.',
                    );

                    return;
                }

                const profileData =
                    result.data?.data ??
                    result.data ??
                    result.profile ??
                    result;

                setProfile(profileData);
            } catch (err) {
                console.error('Lawyer Profile Error:', err);

                setError('ارتباط با سرور برقرار نشد.');
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);

    // =========================
    // دریافت تخصص‌های وکیل
    // =========================

    useEffect(() => {
        const getSpecialties = async () => {
            try {
                setSpecialtiesLoading(true);
                setSpecialtiesError('');

                const token = localStorage.getItem('auth_token');

                if (!token) {
                    setSpecialtiesError(
                        'برای دریافت تخصص‌ها ابتدا وارد حساب کاربری شوید.',
                    );

                    return;
                }

                const response = await fetch(
                    `${API_URL}/lawyer/profile/specialties`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                const result = await response.json();

                console.log('Lawyer Specialties API Response:', result);

                if (response.status === 401) {
                    setSpecialtiesError(
                        'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
                    );

                    return;
                }

                if (!response.ok) {
                    setSpecialtiesError(
                        result.message ||
                            'دریافت تخصص‌های وکیل با خطا مواجه شد.',
                    );

                    return;
                }

                const specialtiesData =
                    result.data?.data ??
                    result.data ??
                    result.specialties ??
                    [];

                setSpecialties(
                    Array.isArray(specialtiesData) ? specialtiesData : [],
                );
            } catch (err) {
                console.error('Lawyer Specialties Error:', err);

                setSpecialtiesError(
                    'ارتباط با سرور برای دریافت تخصص‌ها برقرار نشد.',
                );
            } finally {
                setSpecialtiesLoading(false);
            }
        };

        getSpecialties();
    }, []);

    // =========================
    // دریافت محدوده خدمت
    // =========================

    useEffect(() => {
        const getServiceAreas = async () => {
            try {
                setServiceAreasLoading(true);
                setServiceAreasError('');

                const token = localStorage.getItem('auth_token');

                if (!token) {
                    setServiceAreasError(
                        'برای دریافت محدوده خدمت ابتدا وارد حساب کاربری شوید.',
                    );

                    return;
                }

                const response = await fetch(
                    `${API_URL}/lawyer/profile/service-areas`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                const result = await response.json();

                console.log('Lawyer Service Areas API Response:', result);

                if (response.status === 401) {
                    setServiceAreasError(
                        'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
                    );

                    return;
                }

                if (!response.ok) {
                    setServiceAreasError(
                        result.message || 'دریافت محدوده خدمت با خطا مواجه شد.',
                    );

                    return;
                }

                const serviceAreasData =
                    result.data?.data ??
                    result.data ??
                    result.service_areas ??
                    result.serviceAreas ??
                    [];

                setServiceAreas(
                    Array.isArray(serviceAreasData) ? serviceAreasData : [],
                );
            } catch (err) {
                console.error('Lawyer Service Areas Error:', err);

                setServiceAreasError(
                    'ارتباط با سرور برای دریافت محدوده خدمت برقرار نشد.',
                );
            } finally {
                setServiceAreasLoading(false);
            }
        };

        getServiceAreas();
    }, []);

    // =========================
    // Loading
    // =========================

    if (loading) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} flex min-h-[500px] items-center justify-center bg-[#f8faf9]`}
            >
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dfe7e4] border-t-[#123f37]" />

                    <p className="mt-4 text-sm font-semibold text-[#123f37]">
                        در حال دریافت اطلاعات پروفایل...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // Error
    // =========================

    if (error) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} flex min-h-[500px] items-center justify-center bg-[#f8faf9] px-5`}
            >
                <div className="w-full max-w-[500px] rounded-[20px] border border-[#e4ebe8] bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-extrabold text-red-500">
                        !
                    </div>

                    <h2 className="mt-5 text-lg font-extrabold text-[#123f37]">
                        خطا در دریافت پروفایل
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#71817c]">
                        {error}
                    </p>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="flex-1 rounded-[11px] bg-[#123f37] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d302a]"
                        >
                            تلاش مجدد
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="flex-1 rounded-[11px] border border-[#d8e1dd] bg-white px-4 py-3 text-sm font-bold text-[#123f37] transition hover:bg-[#f5f8f7]"
                        >
                            ورود
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================
    // Profile Not Found
    // =========================

    if (!profile) {
        return (
            <div
                dir="rtl"
                className={`${vazir.className} flex min-h-[500px] items-center justify-center bg-[#f8faf9]`}
            >
                <p className="text-sm font-semibold text-[#71817c]">
                    اطلاعات پروفایل پیدا نشد.
                </p>
            </div>
        );
    }

    // =========================
    // Page
    // =========================

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f8faf9]`}
        >
            <div className="mx-auto w-full max-w-[1400px] px-5 py-10 lg:px-8">
                {/* هدر پروفایل */}
                <ProfileHeader profile={profile} />

                {/* آمار */}
                <div className="mt-5">
                    <ProfileStats profile={profile} />
                </div>

                {/* اطلاعات پروفایل */}
                <div className="mt-5">
                    <ProfileInfo profile={profile} />
                </div>

                {/* ========================= */}
                {/* تخصص‌های وکیل */}
                {/* ========================= */}

                <div className="mt-5">
                    <div className="rounded-[20px] border border-[#e4ebe8] bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-extrabold text-[#123f37]">
                                تخصص‌های وکیل
                            </h2>

                            <p className="mt-2 text-sm text-[#71817c]">
                                حوزه‌های تخصصی و فعالیت‌های حقوقی
                            </p>
                        </div>

                        {specialtiesLoading ? (
                            <div className="mt-6 flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dfe7e4] border-t-[#123f37]" />

                                <span className="text-sm text-[#71817c]">
                                    در حال دریافت تخصص‌ها...
                                </span>
                            </div>
                        ) : specialtiesError ? (
                            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3">
                                <p className="text-sm font-semibold text-red-600">
                                    {specialtiesError}
                                </p>
                            </div>
                        ) : specialties.length > 0 ? (
                            <div className="mt-5 flex flex-wrap gap-3">
                                {specialties.map((specialty, index) => {
                                    const specialtyName =
                                        typeof specialty === 'string'
                                            ? specialty
                                            : (specialty?.name ??
                                              specialty?.title ??
                                              specialty?.specialty ??
                                              '');

                                    return (
                                        <span
                                            key={specialty?.id ?? index}
                                            className="rounded-full border border-[#d8e7e2] bg-[#eef5f2] px-4 py-2 text-sm font-bold text-[#123f37]"
                                        >
                                            {specialtyName}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-xl bg-[#f8faf9] px-4 py-4">
                                <p className="text-sm text-[#71817c]">
                                    هنوز تخصصی برای این وکیل ثبت نشده است.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================= */}
                {/* محدوده خدمت */}
                {/* ========================= */}

                <div className="mt-5">
                    <div className="rounded-[20px] border border-[#e4ebe8] bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-extrabold text-[#123f37]">
                                محدوده خدمت
                            </h2>

                            <p className="mt-2 text-sm text-[#71817c]">
                                شهرها و مناطقی که وکیل خدمات حقوقی ارائه می‌دهد
                            </p>
                        </div>

                        {serviceAreasLoading ? (
                            <div className="mt-6 flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dfe7e4] border-t-[#123f37]" />

                                <span className="text-sm text-[#71817c]">
                                    در حال دریافت محدوده خدمت...
                                </span>
                            </div>
                        ) : serviceAreasError ? (
                            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3">
                                <p className="text-sm font-semibold text-red-600">
                                    {serviceAreasError}
                                </p>
                            </div>
                        ) : serviceAreas.length > 0 ? (
                            <div className="mt-5 flex flex-wrap gap-3">
                                {serviceAreas.map((area, index) => {
                                    const areaName =
                                        typeof area === 'string'
                                            ? area
                                            : (area?.name ??
                                              area?.title ??
                                              area?.city ??
                                              area?.service_area ??
                                              area?.serviceArea ??
                                              '');

                                    return (
                                        <span
                                            key={area?.id ?? index}
                                            className="rounded-full border border-[#e2d4b8] bg-[#faf6ec] px-4 py-2 text-sm font-bold text-[#705a2d]"
                                        >
                                            {areaName}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-xl bg-[#f8faf9] px-4 py-4">
                                <p className="text-sm text-[#71817c]">
                                    هنوز محدوده خدمتی برای این وکیل ثبت نشده
                                    است.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
