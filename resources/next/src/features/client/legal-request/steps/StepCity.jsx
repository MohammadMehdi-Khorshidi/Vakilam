'use client';

import { useEffect, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';

import {
    getCities as fetchCities,
    getProvinces as fetchProvinces,
} from '@/lib/api/references';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepCity({ data, update, validationError }) {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(data.province_id || '');
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [customLocation, setCustomLocation] = useState(data.location_detail || '');

    useEffect(() => {
        const load = async () => {
            try {
                setLoadingProvinces(true);
                const result = await fetchProvinces();
                const items = Array.isArray(result)
                    ? result
                    : Array.isArray(result?.data)
                      ? result.data
                      : [];

                setProvinces(
                    items
                        .map((item) => ({
                            id: item.id,
                            name: item.name || item.title || item.label || item.province_name,
                        }))
                        .filter((item) => item.id && item.name),
                );
            } catch (error) {
                console.error('Provinces API Error:', error);
            } finally {
                setLoadingProvinces(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        if (!selectedProvince) {
            setCities([]);
            return;
        }

        const load = async () => {
            try {
                setLoadingCities(true);
                const result = await fetchCities(selectedProvince);
                const items = Array.isArray(result)
                    ? result
                    : Array.isArray(result?.data)
                      ? result.data
                      : [];

                setCities(
                    items
                        .map((item) => ({
                            id: item.id,
                            name:
                                typeof item === 'string'
                                    ? item
                                    : item.name || item.title || item.label || item.city_name,
                        }))
                        .filter((item) => item.id && item.name),
                );
            } catch (error) {
                console.error('Cities API Error:', error);
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };

        load();
    }, [selectedProvince]);

    const handleProvinceChange = (event) => {
        const provinceId = event.target.value;
        setSelectedProvince(provinceId);
        update('province_id', provinceId);
        update('city', '');
        update('city_id', '');
        setCustomLocation('');
        update('location_detail', '');
    };

    const handleCitySelect = (city) => {
        update('city', city.name);
        update('city_id', city.id || '');
    };

    return (
        <div dir="rtl" className={`${vazir.className} w-full`}>
            <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[15px] font-extrabold text-[#183f38]">
                            شهر اصلی پرونده
                        </h2>
                        <p className="mt-1 text-[12px] leading-6 text-[#7b8986]">
                            شهر را انتخاب کنید؛ قرارداد، چک، ملک یا مرجع رسیدگی بیشتر به آن مرتبط است.
                        </p>
                    </div>

                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#17584b] text-white sm:flex">
                        <MapPin size={21} />
                    </div>
                </div>

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
                                {loadingProvinces ? 'در حال دریافت استان‌ها...' : 'استان را انتخاب کنید'}
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

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <label className="text-[12px] font-bold text-[#23463f]">
                            شهر
                        </label>
                        {loadingCities ? (
                            <div className="flex items-center gap-2 text-[11px] text-[#7b8986]">
                                <Loader2 size={14} className="animate-spin" />
                                در حال دریافت شهرها...
                            </div>
                        ) : null}
                    </div>

                    {!selectedProvince ? (
                        <div className="rounded-xl border border-dashed border-[#d8e4e0] bg-[#fafcfb] px-5 py-6 text-center">
                            <MapPin size={22} className="mx-auto text-[#9aaca7]" />
                            <p className="mt-2 text-[12px] text-[#7b8986]">
                                ابتدا استان را انتخاب کنید
                            </p>
                        </div>
                    ) : loadingCities ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {[1,2,3,4,5,6,7,8].map((item) => (
                                <div key={item} className="h-[48px] animate-pulse rounded-xl bg-[#f1f4f3]" />
                            ))}
                        </div>
                    ) : cities.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {cities.map((city) => {
                                const selected = String(data.city_id) === String(city.id);

                                return (
                                    <button
                                        key={city.id || city.name}
                                        type="button"
                                        onClick={() => handleCitySelect(city)}
                                        className={`group flex h-[48px] items-center justify-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all duration-200 ${
                                            selected
                                                ? 'border-[#c9a96e] bg-[#fffaf0] text-[#173f37] shadow-sm'
                                                : 'border-[#dfe7e4] bg-white text-[#4b5d59] hover:border-[#b8d0c9] hover:bg-[#f7faf8]'
                                        }`}
                                    >
                                        <MapPin size={15} />
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

                <div className="mt-5">
                    <label className="mb-2 block text-[12px] font-bold text-[#23463f]">
                        اگر محل دقیق‌تری لازم است
                    </label>
                    <input
                        type="text"
                        value={customLocation}
                        onChange={(event) => {
                            setCustomLocation(event.target.value);
                            update('location_detail', event.target.value);
                        }}
                        placeholder="مثلاً منطقه، شهرستان یا محل شعبه بانک — اختیاری"
                        className="h-[48px] w-full rounded-xl border border-[#d9e4e1] bg-white px-4 text-[12px] text-[#38504b] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#76a99c] focus:ring-2 focus:ring-[#76a99c]/10"
                    />
                </div>
            </div>

            {validationError ? (
                <p className="mt-3 text-sm font-bold text-red-600">
                    {validationError}
                </p>
            ) : null}
        </div>
    );
}
