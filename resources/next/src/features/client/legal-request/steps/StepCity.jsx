'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { Check, ChevronDown, Loader2, MapPin, Search, X } from 'lucide-react';
import { getCities as fetchCities, getProvinces as fetchProvinces } from '@/lib/api/references';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400','500','600','700','800'] });

function SearchableSelect({ label, placeholder, searchPlaceholder, items, value, onChange, disabled=false, loading=false, emptyText='موردی پیدا نشد.' }) {
    const rootRef = useRef(null);
    const [open,setOpen] = useState(false);
    const [query,setQuery] = useState('');
    const selected = items.find((item)=>String(item.id)===String(value));
    const filtered = useMemo(()=>{
        const q=query.trim().toLocaleLowerCase('fa-IR');
        if(!q) return items;
        return items.filter((item)=>String(item.name||'').toLocaleLowerCase('fa-IR').includes(q));
    },[items,query]);

    useEffect(()=>{
        const close=(event)=>{ if(rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
        document.addEventListener('mousedown',close);
        return ()=>document.removeEventListener('mousedown',close);
    },[]);

    useEffect(()=>{ if(disabled) setOpen(false); },[disabled]);

    return <div ref={rootRef} className="relative">
        <label className="mb-2 block text-[12px] font-bold text-[#23463f]">{label}</label>
        <button type="button" disabled={disabled||loading} onClick={()=>{setOpen(v=>!v);setQuery('')}} className={`flex h-[48px] w-full items-center justify-between rounded-xl border bg-white px-4 text-right text-[13px] outline-none transition ${open?'border-[#76a99c] ring-2 ring-[#76a99c]/10':'border-[#d9e4e1]'} ${disabled||loading?'cursor-not-allowed bg-[#f7f9f8] text-[#9aa5a1]':'text-[#38504b] hover:border-[#b6cec7]'}`}>
            <span className="min-w-0 truncate">{loading?'در حال دریافت...':selected?.name||placeholder}</span>
            {loading?<Loader2 size={17} className="shrink-0 animate-spin text-[#2c7967]"/>:<ChevronDown size={17} className={`shrink-0 text-[#72827e] transition ${open?'rotate-180':''}`}/>} 
        </button>
        {open&&!disabled&&!loading?<div className="absolute right-0 top-[76px] z-50 w-full overflow-hidden rounded-xl border border-[#d9e4e1] bg-white shadow-[0_14px_35px_rgba(20,60,52,0.14)]">
            <div className="border-b border-[#edf1ef] p-2.5"><div className="relative">
                <Search size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9995]"/>
                <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder={searchPlaceholder} className="h-10 w-full rounded-lg border border-[#dfe7e4] bg-[#fafcfb] pr-9 pl-9 text-[12px] text-[#38504b] outline-none focus:border-[#76a99c]"/>
                {query?<button type="button" onClick={()=>setQuery('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#94a09d] hover:bg-slate-100"><X size={13}/></button>:null}
            </div></div>
            <div className="max-h-[220px] overflow-y-auto p-1.5">
                {filtered.length?filtered.map((item)=>{const active=String(item.id)===String(value);return <button key={item.id} type="button" onClick={()=>{onChange(item);setOpen(false);setQuery('')}} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-right text-[12px] transition ${active?'bg-[#edf6f2] font-extrabold text-[#17584b]':'text-[#4b5d59] hover:bg-[#f6f9f8]'}`}><span>{item.name}</span>{active?<Check size={14}/>:null}</button>;}):<p className="px-3 py-6 text-center text-[12px] text-[#8b9995]">{emptyText}</p>}
            </div>
        </div>:null}
    </div>;
}

export default function StepCity({data,update,validationError}){
    const [provinces,setProvinces]=useState([]);
    const [cities,setCities]=useState([]);
    const [selectedProvince,setSelectedProvince]=useState(data.province_id||'');
    const [loadingProvinces,setLoadingProvinces]=useState(false);
    const [loadingCities,setLoadingCities]=useState(false);
    const [customLocation,setCustomLocation]=useState(data.location_detail||'');

    useEffect(()=>{let active=true;(async()=>{try{setLoadingProvinces(true);const result=await fetchProvinces();if(!active)return;const items=Array.isArray(result)?result:Array.isArray(result?.data)?result.data:[];setProvinces(items.map(item=>({id:item.id,name:item.name||item.title||item.label||item.province_name})).filter(item=>item.id&&item.name));}catch(error){console.error('Provinces API Error:',error)}finally{if(active)setLoadingProvinces(false)}})();return()=>{active=false}},[]);
    useEffect(()=>{if(!selectedProvince){setCities([]);return;}let active=true;(async()=>{try{setLoadingCities(true);const result=await fetchCities(selectedProvince);if(!active)return;const items=Array.isArray(result)?result:Array.isArray(result?.data)?result.data:[];setCities(items.map(item=>({id:item.id,name:typeof item==='string'?item:item.name||item.title||item.label||item.city_name})).filter(item=>item.id&&item.name));}catch(error){console.error('Cities API Error:',error);if(active)setCities([])}finally{if(active)setLoadingCities(false)}})();return()=>{active=false}},[selectedProvince]);

    const handleProvince=(province)=>{const id=province?.id||'';setSelectedProvince(id);update('province_id',id);update('province',province?.name||'');update('city','');update('city_id','');setCities([])};
    const handleCity=(city)=>{update('city',city?.name||'');update('city_id',city?.id||'')};

    return <div dir="rtl" className={`${vazir.className} w-full`}>
        <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-[15px] font-extrabold text-[#183f38]">محل اصلی پرونده</h2><p className="mt-1 text-[12px] leading-6 text-[#7b8986]">استان و شهر مرتبط با موضوع یا مرجع احتمالی رسیدگی را انتخاب کنید.</p></div><div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#17584b] text-white sm:flex"><MapPin size={21}/></div></div>
            <div className="grid gap-4 md:grid-cols-2">
                <SearchableSelect label="استان" placeholder="استان را انتخاب کنید" searchPlaceholder="جستجوی استان..." items={provinces} value={selectedProvince} onChange={handleProvince} loading={loadingProvinces} emptyText="استانی با این نام پیدا نشد."/>
                <SearchableSelect label="شهر" placeholder={selectedProvince?'شهر را انتخاب کنید':'ابتدا استان را انتخاب کنید'} searchPlaceholder="جستجوی شهر..." items={cities} value={data.city_id||''} onChange={handleCity} disabled={!selectedProvince} loading={loadingCities} emptyText="شهری با این نام پیدا نشد."/>
            </div>
            <div className="mt-5"><label className="mb-2 block text-[12px] font-bold text-[#23463f]">محل دقیق‌تر (اختیاری)</label><input type="text" value={customLocation} onChange={e=>{setCustomLocation(e.target.value);update('location_detail',e.target.value)}} placeholder="مثلاً منطقه، شهرستان یا محل شعبه بانک" className="h-[48px] w-full rounded-xl border border-[#d9e4e1] bg-white px-4 text-[12px] text-[#38504b] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#76a99c] focus:ring-2 focus:ring-[#76a99c]/10"/></div>
        </div>
        {validationError?<p className="mt-3 text-sm font-bold text-red-600">{validationError}</p>:null}
    </div>;
}
