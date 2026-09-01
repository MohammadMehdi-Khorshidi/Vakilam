'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api';

export default function ServiceAreas() {
    const [serviceAreas, setServiceAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getServiceAreas = async () => {
            try {
                setLoading(true);
                setError('');

                const token = localStorage.getItem('auth_token');

                if (!token) {
                    setError(
                        'برای مشاهده محدوده خدمت ابتدا وارد حساب کاربری خود شوید.',
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
                    localStorage.removeItem('auth_token');

                    setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');

                    return;
                }

                if (!response.ok) {
                    setError(
                        result.message || 'دریافت محدوده خدمت با خطا مواجه شد.',
                    );

                    return;
                }

                const data =
                    result.data?.data ??
                    result.data ??
                    result.service_areas ??
                    result.serviceAreas ??
                    [];

                setServiceAreas(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Service Areas Error:', err);

                setError('ارتباط با سرور برقرار نشد.');
            } finally {
                setLoading(false);
            }
        };

        getServiceAreas();
    }, []);

    if (loading) {
        return (
            <section
                dir="rtl"
                className="rounded-[20px] border border-[#e4ebe8] bg-white p-6 shadow-sm"
            >
                <h2 className="text-lg font-extrabold text-[#123f37]">
                    محدوده خدمت
                </h2>

                <p className="mt-2 text-sm text-[#71817c]">
                    شهرها و مناطقی که خدمات حقوقی ارائه می‌دهید
                </p>

                <div className="mt-6 flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dfe7e4] border-t-[#123f37]" />

                    <span className="text-sm text-[#71817c]">
                        در حال دریافت محدوده خدمت...
                    </span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section
                dir="rtl"
                className="rounded-[20px] border border-[#e4ebe8] bg-white p-6 shadow-sm"
            >
                <h2 className="text-lg font-extrabold text-[#123f37]">
                    محدوده خدمت
                </h2>

                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm font-semibold text-red-600">
                        {error}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            dir="rtl"
            className="rounded-[20px] border border-[#e4ebe8] bg-white p-6 shadow-sm"
        >
            <div>
                <h2 className="text-lg font-extrabold text-[#123f37]">
                    محدوده خدمت
                </h2>

                <p className="mt-2 text-sm text-[#71817c]">
                    شهرها و مناطقی که خدمات حقوقی ارائه می‌دهید
                </p>
            </div>

            {serviceAreas.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
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
                            <div
                                key={area?.id ?? index}
                                className="rounded-xl border border-[#e2d4b8] bg-[#faf6ec] px-5 py-3"
                            >
                                <span className="text-sm font-bold text-[#705a2d]">
                                    {areaName}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-6 rounded-xl bg-[#f8faf9] px-4 py-5">
                    <p className="text-sm text-[#71817c]">
                        هنوز محدوده خدمتی ثبت نشده است.
                    </p>
                </div>
            )}
        </section>
    );
}
