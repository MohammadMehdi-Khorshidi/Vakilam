'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/lawyer/profile';

export default function EditLawyerProfile({ profile, onSuccess, onCancel }) {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        national_code: '',
        license_number: '',
        bar_association: '',
        specialty: '',
        city: '',
        address: '',
        bio: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!profile) return;

        setForm({
            first_name: profile.first_name ?? '',
            last_name: profile.last_name ?? '',
            phone: profile.phone ?? '',
            email: profile.email ?? '',
            national_code: profile.national_code ?? '',
            license_number: profile.license_number ?? '',
            bar_association: profile.bar_association ?? '',
            specialty: profile.specialty ?? '',
            city: profile.city ?? '',
            address: profile.address ?? '',
            bio: profile.bio ?? '',
        });
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const token = localStorage.getItem('auth_token');

            if (!token) {
                setError('برای ویرایش پروفایل ابتدا وارد حساب کاربری شوید.');
                return;
            }

            const response = await fetch(`${API_URL}/lawyer/profile`, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const result = await response.json();

            console.log('Update Lawyer Profile:', result);

            if (response.status === 401) {
                localStorage.removeItem('auth_token');

                setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');

                return;
            }

            if (response.status === 422) {
                const errors = result.errors;

                if (errors) {
                    const firstError = Object.values(errors).flat().at(0);

                    setError(firstError || 'اطلاعات وارد شده صحیح نیست.');
                } else {
                    setError(result.message || 'اطلاعات وارد شده صحیح نیست.');
                }

                return;
            }

            if (!response.ok) {
                setError(result.message || 'ویرایش پروفایل با خطا مواجه شد.');

                return;
            }

            setSuccess(result.message || 'پروفایل با موفقیت ویرایش شد.');

            const updatedProfile =
                result.data?.data ?? result.data ?? result.profile ?? result;

            if (onSuccess) {
                onSuccess(updatedProfile);
            }
        } catch (err) {
            console.error('Update Lawyer Profile Error:', err);

            setError('ارتباط با سرور برقرار نشد.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full rounded-xl border border-[#dfe7e4] bg-white px-4 py-3 text-sm text-[#123f37] outline-none transition placeholder:text-[#a0aaa6] focus:border-[#123f37] focus:ring-2 focus:ring-[#123f37]/10';

    const labelClass = 'mb-2 block text-sm font-bold text-[#123f37]';

    return (
        <form
            onSubmit={handleSubmit}
            dir="rtl"
            className="rounded-[20px] border border-[#e4ebe8] bg-white p-6 shadow-sm"
        >
            <div className="mb-7">
                <h2 className="text-xl font-extrabold text-[#123f37]">
                    ویرایش پروفایل
                </h2>

                <p className="mt-2 text-sm text-[#71817c]">
                    اطلاعات پروفایل خود را ویرایش کنید.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                    <label htmlFor="first_name" className={labelClass}>
                        نام
                    </label>

                    <input
                        id="first_name"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="نام"
                    />
                </div>

                <div>
                    <label htmlFor="last_name" className={labelClass}>
                        نام خانوادگی
                    </label>

                    <input
                        id="last_name"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="نام خانوادگی"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className={labelClass}>
                        شماره موبایل
                    </label>

                    <input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="09123456789"
                    />
                </div>

                <div>
                    <label htmlFor="email" className={labelClass}>
                        ایمیل
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="example@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="national_code" className={labelClass}>
                        کد ملی
                    </label>

                    <input
                        id="national_code"
                        name="national_code"
                        value={form.national_code}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="کد ملی"
                    />
                </div>

                <div>
                    <label htmlFor="license_number" className={labelClass}>
                        شماره پروانه وکالت
                    </label>

                    <input
                        id="license_number"
                        name="license_number"
                        value={form.license_number}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="شماره پروانه"
                    />
                </div>

                <div>
                    <label htmlFor="bar_association" className={labelClass}>
                        کانون وکلا
                    </label>

                    <input
                        id="bar_association"
                        name="bar_association"
                        value={form.bar_association}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="کانون وکلا"
                    />
                </div>

                <div>
                    <label htmlFor="specialty" className={labelClass}>
                        تخصص
                    </label>

                    <input
                        id="specialty"
                        name="specialty"
                        value={form.specialty}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="مثلاً حقوق خانواده"
                    />
                </div>

                <div>
                    <label htmlFor="city" className={labelClass}>
                        شهر
                    </label>

                    <input
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="مثلاً تهران"
                    />
                </div>

                <div>
                    <label htmlFor="address" className={labelClass}>
                        آدرس
                    </label>

                    <input
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="آدرس دفتر"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="bio" className={labelClass}>
                        درباره من
                    </label>

                    <textarea
                        id="bio"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows={5}
                        className={`${inputClass} resize-none`}
                        placeholder="درباره سوابق و تخصص خود بنویسید..."
                    />
                </div>
            </div>

            {error && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    {success}
                </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-xl border border-[#d8e1dd] bg-white px-6 py-3 text-sm font-bold text-[#123f37] transition hover:bg-[#f5f8f7]"
                >
                    انصراف
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[#123f37] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#0d302a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
            </div>
        </form>
    );
}
