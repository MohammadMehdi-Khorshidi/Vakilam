'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export default function AdminSearchSelect({
    value = '',
    onChange,
    options = [],
    placeholder = 'انتخاب کنید',
    searchPlaceholder = 'جستجو...',
    allLabel = 'همه',
    className = '',
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const rootRef = useRef(null);

    const selected = options.find((item) => String(item.value) === String(value));

    const filtered = useMemo(() => {
        const q = search.trim().toLocaleLowerCase('fa-IR');
        if (!q) return options;
        return options.filter((item) =>
            String(item.label || '').toLocaleLowerCase('fa-IR').includes(q),
        );
    }, [options, search]);

    useEffect(() => {
        const handler = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-[#d6e2dd] bg-white px-4 text-right text-sm font-bold text-[#31564d] shadow-[0_4px_18px_rgba(13,51,44,0.035)] transition hover:border-[#b7cec6]"
            >
                <span className={selected ? '' : 'text-[#8b9994]'}>
                    {selected?.label || (value === '' ? allLabel : placeholder)}
                </span>
                <ChevronDown size={17} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[240px] overflow-hidden rounded-2xl border border-[#d9e4df] bg-white shadow-[0_18px_50px_rgba(13,51,44,0.16)]">
                    <div className="border-b border-[#edf2ef] p-3">
                        <div className="flex items-center gap-2 rounded-xl border border-[#dce5e1] bg-[#f8faf9] px-3">
                            <Search size={16} className="text-[#789089]" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={searchPlaceholder}
                                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa7a2]"
                            />
                            {search ? (
                                <button type="button" onClick={() => setSearch('')} className="text-[#8b9994]">
                                    <X size={15} />
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                                setSearch('');
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-sm transition hover:bg-[#f3f7f5] ${
                                value === '' ? 'bg-[#eef6f3] font-black text-[#174c42]' : 'text-[#536a63]'
                            }`}
                        >
                            <span>{allLabel}</span>
                            {value === '' ? <Check size={15} /> : null}
                        </button>

                        {filtered.map((item) => {
                            const active = String(item.value) === String(value);
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(item.value);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-sm transition hover:bg-[#f3f7f5] ${
                                        active ? 'bg-[#eef6f3] font-black text-[#174c42]' : 'text-[#536a63]'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {active ? <Check size={15} /> : null}
                                </button>
                            );
                        })}

                        {!filtered.length ? (
                            <p className="px-3 py-6 text-center text-xs text-[#8a9792]">
                                موردی پیدا نشد.
                            </p>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
