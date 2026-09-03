'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, Loader2, MapPin } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';
import { apiRequest } from '@/lib/api/client';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400', '500', '600', '700', '800'] });

export default function StepCity({ data, update }) {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingCities, setLoadingCities] = useState(false);
    const selectedProvince = data.province_id || '';

    useEffect(() => {
        let active = true;
        apiRequest('/reference/provinces')
            .then((result) => active && setProvinces(Array.isArray(result?.data) ? result.data : []))
            .catch(() => active && setProvinces([]))
            .finally(() => active && setLoadingProvinces(false));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!selectedProvince) { setCities([]); return; }
        let active = true;
        setLoadingCities(true);
        apiRequest(`/reference/provinces/${selectedProvince}/cities`)
            .then((result) => active && setCities(Array.isArray(result?.data) ? result.data : []))
            .catch(() => active && setCities([]))
            .finally(() => active && setLoadingCities(false));
        return () => { active = false; };
    }, [selectedProvince]);

    return (
        <div dir="rtl" className={vazir.className}>
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-bold">استان</label>
                    <div className="relative">
                        <select value={selectedProvince} disabled={loadingProvinces}
                            onChange={(e) => { update('province_id', e.target.value ? Number(e.target.value) : ''); update('city_id', ''); update('city', ''); }}
                            className="h-12 w-full appearance-none rounded-xl border border-[#d9e4e1] bg-white px-4 outline-none">
                            <option value="">{loadingProvinces ? 'در حال دریافت...' : 'استان را انتخاب کنید'}</option>
                            {provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
                        </select>
                        {loadingProvinces ? <Loader2 size={18} className="absolute left-4 top-4 animate-spin"/> : <ChevronDown size={18} className="pointer-events-none absolute left-4 top-4"/>}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold">شهر</label>
                    {!selectedProvince ? <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">ابتدا استان را انتخاب کنید.</div> : loadingCities ? <div className="flex items-center gap-2 p-4 text-sm"><Loader2 size={16} className="animate-spin"/>در حال دریافت شهرها...</div> : (
                        <div className="grid max-h-64 grid-cols-2 gap-2 overflow-auto">
                            {cities.map((city) => {
                                const active = String(data.city_id) === String(city.id);
                                return <button key={city.id} type="button" onClick={() => { update('city_id', Number(city.id)); update('city', city.name); }} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm ${active ? 'border-[#c9a96e] bg-[#fffaf0]' : 'border-[#dfe7e4]'}`}><MapPin size={14}/>{city.name}{active ? <Check size={14}/> : null}</button>;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
