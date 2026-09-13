'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function TimePart({ label, value, items, onChange }) {
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const close = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div ref={rootRef} className="relative min-w-0 flex-1">
            <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                aria-label={label}
                className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm font-black text-[#38504b] outline-none transition ${
                    open
                        ? 'border-[#76a99c] ring-2 ring-[#76a99c]/10'
                        : 'border-[#d9e4e1] hover:border-[#b6cec7]'
                }`}
            >
                <span dir="ltr">{value}</span>
                <ChevronDown
                    size={16}
                    className={`text-[#72827e] transition ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open ? (
                <div className="absolute right-0 top-[54px] z-50 w-full overflow-hidden rounded-xl border border-[#d9e4e1] bg-white shadow-[0_14px_35px_rgba(20,60,52,0.14)]">
                    <div className="max-h-[220px] overflow-y-auto p-1.5">
                        {items.map((item) => {
                            const active = item === value;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => {
                                        onChange(item);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                                        active
                                            ? 'bg-[#edf6f2] font-black text-[#17584b]'
                                            : 'text-[#4b5d59] hover:bg-[#f6f9f8]'
                                    }`}
                                >
                                    <span dir="ltr">{item}</span>
                                    {active ? <Check size={14} /> : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function Time24Input({ value, onChange }) {
    const [hour = '00', minute = '00'] = (value || '00:00').split(':');

    return (
        <div dir="ltr" className="flex items-center gap-2">
            <TimePart
                label="ساعت"
                value={hour}
                items={hours}
                onChange={(nextHour) => onChange(`${nextHour}:${minute}`)}
            />
            <span className="text-lg font-black text-[#82908c]">:</span>
            <TimePart
                label="دقیقه"
                value={minute}
                items={minutes}
                onChange={(nextMinute) => onChange(`${hour}:${nextMinute}`)}
            />
        </div>
    );
}
