'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api';

export default function LawyerSpecialties() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getSpecialties = async () => {
            try {
                setLoading(true);
                setError('');

                const token = localStorage.getItem('auth_token');

                if (!token) {
                    setError(
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

                console.log('Lawyer Specialties API:', result);

                if (response.status === 401) {
                    setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
                    return;
                }

                if (!response.ok) {
                    setError(
                        result.message || 'دریافت تخصص‌ها با خطا مواجه شد.',
                    );
                    return;
                }

                const data =
                    result.data?.data ??
                    result.data ??
                    result.specialties ??
                    [];

                setSpecialties(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Lawyer Specialties Error:', error);

                setError('ارتباط با سرور برقرار نشد.');
            } finally {
                setLoading(false);
            }
        };

        getSpecialties();
    }, []);

    if (loading) {
        return (
            <div className="rounded-[20px] border border-[#e4ebe8] bg-white p-6">
                <p className="text-sm font-semibold text-[#71817c]">
                    در حال دریافت تخصص‌ها...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[20px] border border-red-100 bg-red-50 p-6">
                <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <section
            dir="rtl"
            className="rounded-[20px] border border-[#e4ebe8] bg-white p-6 shadow-sm"
        >
            <h2 className="text-lg font-extrabold text-[#123f37]">
                تخصص‌های وکیل
            </h2>

            <p className="mt-2 text-sm text-[#71817c]">
                حوزه‌های تخصصی فعالیت وکیل
            </p>

            {specialties.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3">
                    {specialties.map((specialty, index) => {
                        const name =
                            typeof specialty === 'string'
                                ? specialty
                                : (specialty.name ?? specialty.title ?? '');

                        return (
                            <span
                                key={specialty.id ?? index}
                                className="rounded-full bg-[#eef5f2] px-4 py-2 text-sm font-bold text-[#123f37]"
                            >
                                {name}
                            </span>
                        );
                    })}
                </div>
            ) : (
                <p className="mt-5 text-sm text-[#71817c]">
                    هنوز تخصصی برای پروفایل ثبت نشده است.
                </p>
            )}
        </section>
    );
}
