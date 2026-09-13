export function formatPersianDate(value, withTime=false){
    if(!value) return '—';
    const opts={calendar:'persian',numberingSystem:'latn',year:'numeric',month:'long',day:'numeric',weekday:'long'};
    if(withTime){opts.hour='2-digit';opts.minute='2-digit';opts.hour12=false;}
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian',opts).format(new Date(value));
}
export function formatTime24(value){
    if(!value)return '—';
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
}
export function toIsoFromLocal(dateKey,time){
    if(!dateKey||!time)return null;
    const d=new Date(`${dateKey}T${time}:00`); return Number.isNaN(d.getTime())?null:d.toISOString();
}
export function splitLocal(value){
    if(!value)return {date:'',time:'00:00'}; const d=new Date(value); const pad=n=>String(n).padStart(2,'0');
    return {date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,time:`${pad(d.getHours())}:${pad(d.getMinutes())}`};
}
