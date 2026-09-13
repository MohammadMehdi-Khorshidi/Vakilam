'use client';

const hours=Array.from({length:24},(_,i)=>String(i).padStart(2,'0'));
const minutes=Array.from({length:60},(_,i)=>String(i).padStart(2,'0'));
export default function Time24Input({value,onChange}){
    const [h='00',m='00']=(value||'00:00').split(':');
    return <div dir="ltr" className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-2 focus-within:border-[#76a99c]">
        <select aria-label="ساعت" value={h} onChange={e=>onChange(`${e.target.value}:${m}`)} className="h-full flex-1 bg-transparent text-center text-sm font-bold outline-none">{hours.map(x=><option key={x}>{x}</option>)}</select>
        <span className="font-black text-slate-400">:</span>
        <select aria-label="دقیقه" value={m} onChange={e=>onChange(`${h}:${e.target.value}`)} className="h-full flex-1 bg-transparent text-center text-sm font-bold outline-none">{minutes.map(x=><option key={x}>{x}</option>)}</select>
    </div>;
}
