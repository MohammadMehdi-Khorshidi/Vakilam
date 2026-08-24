'use client';

import { useState } from 'react';
import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const tabs = [
    {
        id: 'overview',
        label: 'نمای کلی',
    },
    {
        id: 'messages',
        label: 'پیام‌ها و تماس‌ها',
    },
    {
        id: 'tasks',
        label: 'کارها',
    },
    {
        id: 'meetings',
        label: 'جلسات',
    },
    {
        id: 'documents',
        label: 'اسناد',
    },
    {
        id: 'contracts',
        label: 'قرارداد',
    },
    {
        id: 'collaboration',
        label: 'وضعیت همکاری',
    },
];

const MessagesTabs = () => {
    const [activeTab, setActiveTab] = useState('messages');

    return (
        <div
            dir="rtl"
            className={`${vazirmatn.className} mb-4 overflow-x-auto rounded-[18px] border border-[#dfe8e4] bg-white p-1.5 shadow-[0_4px_18px_rgba(18,63,55,0.045)]`}
        >
            <div className="flex min-w-max items-center justify-start gap-1">
                {tabs.map((tab) => {
                    const active = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-[13px] px-5 py-2.5 font-bold transition-all duration-200 ${
                                active
                                    ? 'bg-[#123f37] text-white shadow-[0_5px_14px_rgba(18,63,55,0.18)]'
                                    : 'text-[#52645f] hover:bg-[#eef4f1] hover:text-[#123f37]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MessagesTabs;
