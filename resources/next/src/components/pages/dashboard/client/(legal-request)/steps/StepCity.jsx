'use client';

import { useEffect, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { Check, MapPin, ChevronDown, Loader2 } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const API_URL = 'http://127.0.0.1:8000/api';

const fallbackCities = [
    { id: 1, name: 'تهران' },
    { id: 2, name: 'کرج' },
    { id: 3, name: 'اصفهان' },
    { id: 4, name: 'شیراز' },
    { id: 5, name: 'مشهد' },
    { id: 6, name: 'تبریز' },
    { id: 7, name: 'اهواز' },
    { id: 8, name: 'قم' },
];

export default function StepCity({ data, update }) {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState(fallbackCities);

    const [selectedProvince, setSelectedProvince] = useState(
        data.province_id || '',
    );

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const [customLocation, setCustomLocation] = useState(
        data.location_detail || '',
    );

    // =====================================================
    // دریافت استان‌ها
    // =====================================================

    useEffect(() => {
        const getProvinces = async () => {
            try {
                setLoadingProvinces(true);

                const response = await fetch(`${API_URL}/reference/provinces`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const result = await response.json();

                console.log('Provinces API Response:', result);

                if (!response.ok) {
                    return;
                }

                const provinceData = Array.isArray(result.data)
                    ? result.data
                    : [];

                const formattedProvinces = provinceData
                    .map((item) => ({
                        id: item.id,
                        name:
                            item.name ||
                            item.title ||
                            item.label ||
                            item.province_name,
                    }))
                    .filter((item) => item.id && item.name);

                setProvinces(formattedProvinces);
            } catch (error) {
                console.error('Provinces API Error:', error);
            } finally {
                setLoadingProvinces(false);
            }
        };

        getProvinces();
    }, []);

    // =====================================================
    // وقتی استان انتخاب شد → شهرهای استان
    // =====================================================

    useEffect(() => {
        if (!selectedProvince) {
            return;
        }

        const getCities = async () => {
            try {
                setLoadingCities(true);

                const response = await fetch(
                    `${API_URL}/reference/provinces/${selectedProvince}/cities`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                const result = await response.json();

                console.log('Cities API Response:', result);

                if (!response.ok) {
                    return;
                }

                const cityData = Array.isArray(result.data) ? result.data : [];

                const formattedCities = cityData
                    .map((item) => ({
                        id: item.id,
                        name:
                            typeof item === 'string'
                                ? item
                                : item.name ||
                                  item.title ||
                                  item.label ||
                                  item.city_name,
                    }))
                    .filter((item) => item.name);

                if (formattedCities.length > 0) {
                    setCities(formattedCities);
                } else {
                    setCities([]);
                }
            } catch (error) {
                console.error('Cities API Error:', error);

                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };

        getCities();
    }, [selectedProvince]);

    // =====================================================
    // انتخاب استان
    // =====================================================

    const handleProvinceChange = (event) => {
        const provinceId = event.target.value;

        setSelectedProvince(provinceId);

        // ذخیره استان
        update('province_id', provinceId);

        // با تغییر استان، شهر قبلی پاک شود
        update('city', '');

        setCustomLocation('');
        update('location_detail', '');
    };

    // =====================================================
    // انتخاب شهر
    // =====================================================

    const handleCitySelect = (city) => {
        update('city', city.name);
        update('city_id', city.id || '');

        console.log('Selected City:', city);
    };

    // =====================================================
    // محل دقیق‌تر
    // =====================================================

    const handleLocationChange = (event) => {
        const value = event.target.value;

        setCustomLocation(value);

        update('location_detail', value);
    };

    // =====================================================
    // Render
    // =====================================================

    return (
        <div dir="rtl" className={`${vazir.className} w-full`}>
            {/* =================================================
                Notice
            ================================================= */}

            <div className="mb-5 rounded-2xl border border-[#d5e7df] bg-[#f1f8f5] px-5 py-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2c7967] text-white">
                        <Check size={17} strokeWidth={2.5} />
                    </div>

                    <div>
                        <h3 className="text-[14px] font-extrabold text-[#173f37]">
                            این مرحله مانع ادامه نیست
                        </h3>

                        <p className="mt-1 text-[12px] leading-6 text-[#71827e]">
                            شهر به محل پرونده و انتخاب وکیل مرتبط است؛ فقط دقت
                            تطبیق وکلا را بیشتر می‌کند.
                        </p>
                    </div>
                </div>
            </div>

            {/* =================================================
                Main Card
            ================================================= */}

            <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 sm:p-6">
                {/* Header */}

                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[15px] font-extrabold text-[#183f38]">
                            شهر اصلی پرونده
                        </h2>

                        <p className="mt-1 text-[12px] leading-6 text-[#7b8986]">
                            شهر را انتخاب کنید؛ قرارداد، چک، ملک یا مرجع رسیدگی
                            بیشتر به آن مرتبط است.
                        </p>
                    </div>

                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#17584b] text-white sm:flex">
                        <MapPin size={21} />
                    </div>
                </div>

                {/* =================================================
                    Province Select
                ================================================= */}

                <div className="mb-5">
                    <label className="mb-2 block text-[12px] font-bold text-[#23463f]">
                        استان
                    </label>

                    <div className="relative">
                        <select
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            disabled={loadingProvinces}
                            className="h-[48px] w-full appearance-none rounded-xl border border-[#d9e4e1] bg-white px-4 pl-10 text-[13px] text-[#38504b] outline-none transition focus:border-[#76a99c] focus:ring-2 focus:ring-[#76a99c]/10 disabled:bg-[#f7f9f8]"
                        >
                            <option value="">
                                {loadingProvinces
                                    ? 'در حال دریافت استان‌ها...'
                                    : 'استان را انتخاب کنید'}
                            </option>

                            {provinces.map((province) => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>

                        {loadingProvinces ? (
                            <Loader2
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-[#2c7967]"
                            />
                        ) : (
                            <ChevronDown
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#72827e]"
                            />
                        )}
                    </div>
                </div>

                {/* =================================================
                    Cities
                ================================================= */}

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <label className="text-[12px] font-bold text-[#23463f]">
                            شهر
                        </label>

                        {loadingCities && (
                            <div className="flex items-center gap-2 text-[11px] text-[#7b8986]">
                                <Loader2 size={14} className="animate-spin" />
                                در حال دریافت شهرها...
                            </div>
                        )}
                    </div>

                    {!selectedProvince ? (
                        <div className="rounded-xl border border-dashed border-[#d8e4e0] bg-[#fafcfb] px-5 py-6 text-center">
                            <MapPin
                                size={22}
                                className="mx-auto text-[#9aaca7]"
                            />

                            <p className="mt-2 text-[12px] text-[#7b8986]">
                                ابتدا استان را انتخاب کنید
                            </p>
                        </div>
                    ) : loadingCities ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                <div
                                    key={item}
                                    className="h-[48px] animate-pulse rounded-xl bg-[#f1f4f3]"
                                />
                            ))}
                        </div>
                    ) : cities.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {cities.map((city) => {
                                const isSelected = data.city === city.name;

                                return (
                                    <button
                                        key={city.id || city.name}
                                        type="button"
                                        onClick={() => handleCitySelect(city)}
                                        className={`group flex h-[48px] items-center justify-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all duration-200 ${
                                            isSelected
                                                ? 'border-[#c9a96e] bg-[#fffaf0] text-[#173f37] shadow-sm'
                                                : 'border-[#dfe7e4] bg-white text-[#4b5d59] hover:border-[#b8d0c9] hover:bg-[#f7faf8]'
                                        }`}
                                    >
                                        <MapPin
                                            size={15}
                                            className={
                                                isSelected
                                                    ? 'text-[#c49d50]'
                                                    : 'text-[#758782]'
                                            }
                                        />

                                        <span>{city.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-[#d8e4e0] bg-[#fafcfb] px-5 py-6 text-center">
                            <p className="text-[12px] text-[#7b8986]">
                                شهری برای این استان پیدا نشد.
                            </p>
                        </div>
                    )}
                </div>

                {/* =================================================
                    Custom Exact Location
                ================================================= */}

                <div className="mt-5">
                    <label className="mb-2 block text-[12px] font-bold text-[#23463f]">
                        اگر محل دقیق‌تری لازم است
                    </label>

                    <input
                        type="text"
                        value={customLocation}
                        onChange={handleLocationChange}
                        placeholder="مثلاً منطقه، شهرستان یا محل شعبه بانک — اختیاری"
                        className="h-[48px] w-full rounded-xl border border-[#d9e4e1] bg-white px-4 text-[12px] text-[#38504b] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#76a99c] focus:ring-2 focus:ring-[#76a99c]/10"
                    />
                </div>

                {/* =================================================
                    Info
                ================================================= */}

                <div className="mt-4 rounded-xl border border-[#d8e9f0] bg-[#f2f9fc] px-4 py-3">
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#668d9c]">
                            <span className="text-[11px] font-bold">i</span>
                        </div>

                        <p className="text-[11px] leading-6 text-[#71858d]">
                            در این مرحله فقط شهر یا محل کلی پرونده را ثبت
                            می‌کنیم. نشانی کامل در صورت ضرورت و با دسترسی
                            کنترل‌شده دریافت می‌شود.
                        </p>
                    </div>
                </div>
            </div>

            {/* =================================================
                Saved State
            ================================================= */}

            {data.city && (
                <div className="mt-4 rounded-xl border border-[#d9e8e2] bg-[#f8fcfa] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] text-[#83908d]">
                                شهر انتخاب‌شده
                            </p>

                            <p className="mt-1 text-[13px] font-extrabold text-[#17584b]">
                                {data.city}
                            </p>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f806c] text-white">
                            <Check size={16} />
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                Description
            ================================================= */}

            <p className="mt-4 text-[11px] leading-6 text-[#7c8986]">
                این مورد برای پیشنهاد وکیل مناسب و تعیین حوزه رسیدگی استفاده
                می‌شود.
            </p>
        </div>
    );
}
