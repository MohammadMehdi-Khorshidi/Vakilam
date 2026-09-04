'use client';

import { Vazirmatn } from 'next/font/google';
import InboxHeader from '@/features/client/smart-box/InboxHeader';
import NewProposal from '@/features/client/smart-box/NewProposal';
import InboxNotifications from '@/features/client/smart-box/InboxNotifications';




const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const SmartBoxPage = () => {
    return (
        <main
            dir="ltr"
            className={`${vazir.className} min-h-[calc(100vh-80px)] mt-12  bg-[#f8faf9]`}
        >
            <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8">
                <InboxHeader />

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
                    {/* پیشنهاد جدید */}
                    <NewProposal />

                    {/* صندوق اعلان‌ها */}
                    <InboxNotifications />
                </div>
            </div>
        </main>
    );
};

export default SmartBoxPage;
