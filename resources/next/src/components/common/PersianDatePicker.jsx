'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const partsFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian', { year:'numeric', month:'numeric', day:'numeric' });
const titleFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year:'numeric', month:'long' });
const fullFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
const weekdays=['ش','ی','د','س','چ','پ','ج'];

function localKey(date){
    const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}
function pparts(date){
    const out={}; partsFormatter.formatToParts(date).forEach((p)=>{ if(p.type==='year'||p.type==='month'||p.type==='day') out[p.type]=Number(p.value); }); return out;
}

export default function PersianDatePicker({value,onChange,minToday=true}){
    const days=useMemo(()=>{
        const list=[]; const start=new Date(); start.setHours(12,0,0,0); start.setDate(start.getDate()-(minToday?0:30));
        for(let i=0;i<400;i++){ const d=new Date(start); d.setDate(start.getDate()+i); const p=pparts(d); list.push({date:d,key:localKey(d),...p}); }
        return list;
    },[minToday]);
    const months=useMemo(()=>{
        const map=new Map(); for(const item of days){ const k=`${item.year}-${item.month}`; if(!map.has(k)) map.set(k,[]); map.get(k).push(item); } return [...map.entries()].map(([key,items])=>({key,items,title:titleFormatter.format(items[0].date)}));
    },[days]);
    const selected=days.find((d)=>d.key===value);
    const initialIndex=Math.max(0,months.findIndex((m)=>m.items.some((d)=>d.key===value)));
    const [monthIndex,setMonthIndex]=useState(initialIndex);
    useEffect(()=>{ if(selected){ const idx=months.findIndex((m)=>m.items.some((d)=>d.key===value)); if(idx>=0)setMonthIndex(idx); } },[value]);
    const month=months[monthIndex]||months[0];
    const lead=month?.items?.length ? (month.items[0].date.getDay()+1)%7 : 0;

    return <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
            <button type="button" disabled={monthIndex>=months.length-1} onClick={()=>setMonthIndex(i=>Math.min(i+1,months.length-1))} className="rounded-lg p-2 hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={17}/></button>
            <div className="flex items-center gap-2 text-sm font-black text-[#294e46]"><CalendarDays size={16}/>{month?.title}</div>
            <button type="button" disabled={monthIndex<=0} onClick={()=>setMonthIndex(i=>Math.max(i-1,0))} className="rounded-lg p-2 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={17}/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">{weekdays.map(w=><div key={w} className="py-1">{w}</div>)}</div>
        <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({length:lead}).map((_,i)=><span key={`b${i}`}/>) }
            {month?.items.map((item)=>{
                const active=item.key===value;
                return <button key={item.key} type="button" onClick={()=>onChange(item.key)} title={fullFormatter.format(item.date)} className={`h-9 rounded-lg text-xs font-bold transition ${active?'bg-[#173f38] text-white':'text-slate-600 hover:bg-[#edf6f2]'}`}>{new Intl.NumberFormat('fa-IR').format(item.day)}</button>;
            })}
        </div>
        <p className="mt-3 text-center text-xs font-bold text-[#58736b]">{selected?fullFormatter.format(selected.date):'تاریخ را از تقویم شمسی انتخاب کنید'}</p>
    </div>;
}
