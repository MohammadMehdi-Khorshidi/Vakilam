'use client';

import { Vazirmatn } from 'next/font/google';
import AssistantHeader from '../../../features/client/legal-assistant/AssistantHeader';
import LegalChat from '../../../features/client/legal-assistant/LegalChat';
import AssistantNotice from '../../../features/client/legal-assistant/AssistantNotice';




const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ClientAssistantPage = () => {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-[calc(100vh-80px)]  bg-[#f8faf9]`}
        >
            <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8">
                <AssistantHeader />

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
                    <LegalChat />

                    <div className="flex flex-col gap-6">
                        <AssistantNotice />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ClientAssistantPage;
