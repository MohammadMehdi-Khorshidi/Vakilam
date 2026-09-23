'use client';

import { Search, X } from 'lucide-react';

export default function AdminSearchBox({ value, onChange, placeholder = 'جستجو...', className = '' }) {
    return (
        <label className={`flex min-h-12 items-center gap-3 rounded-2xl border border-[#d6e2dd] bg-white px-4 shadow-[0_4px_18px_rgba(13,51,44,0.035)] transition focus-within:border-[#b7cec6] ${className}`}>
            <Search size={18} className="shrink-0 text-[#6e8780]" />
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#31564d] outline-none placeholder:text-[#9aa7a2]"
            />
            {value ? (
                <button type="button" onClick={() => onChange('')} className="text-[#8b9994]">
                    <X size={16} />
                </button>
            ) : null}
        </label>
    );
}
