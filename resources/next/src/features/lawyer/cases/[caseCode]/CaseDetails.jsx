'use client';

import { useState } from 'react';

import CaseTabs, {
    caseTabs,
} from './CaseTabs';
import LastUpdatedTime from './LastUpdatedTime';
import OverviewContent from './OverviewContent';
import CollaborationDetails from './working-relationship/CollaborationDetails';
import CaseTasks from './tasks/CaseTasks';
import CaseMessages from './messages-calls/CaseMessages';
import CaseMeetings from './meetings/CaseMeetings';
import CaseDocuments from './documents/CaseDocuments';
import CaseContract from './contracts/CaseContract';
import CasePayments from './payments/CasePayments';
import CaseAssistant from './legal-assistant/CaseAssistant';
import CaseHistory from './history/CaseHistory';
import CaseInformation from '@/features/lawyer/cases/[caseCode]/general-information/CaseInformation';
export default function CaseDetails({ caseItem, initialTab = 'overview' }) {
    const validInitialTab = caseTabs.some((tab) => tab.id === initialTab)
        ? initialTab
        : 'overview';

    const [activeTab, setActiveTab] = useState(validInitialTab);

    const selectedTab =
        caseTabs.find((tab) => tab.id === activeTab) ?? caseTabs[0];

    function handleTabChange(tabId) {
        setActiveTab(tabId);

        const url = new URL(window.location.href);

        if (tabId === 'overview') {
            url.searchParams.delete('tab');
        } else {
            url.searchParams.set('tab', tabId);
        }

        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    }

    if (!caseItem) {
        return (
            <div
                dir="rtl"
                className="mx-auto w-full max-w-[1500px] rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700"
            >
                اطلاعات پرونده دریافت نشد.
            </div>
        );
    }

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px]">
            <section className="mb-6">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-sm font-bold text-[#a47b2c]">
                            پرونده {caseItem.code}
                        </p>

                        <h1 className="mt-3 text-3xl font-black text-[#0b302b] sm:text-4xl">
                            {caseItem.title}
                        </h1>

                        <p className="mt-3 text-sm text-[#75847f]">
                            موکل: {caseItem.client} · {caseItem.category} ·{' '}
                            {caseItem.city}
                        </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                        <span className="size-2 rounded-full bg-emerald-500" />

                        {caseItem.status}
                    </div>
                </div>
            </section>

            <section className="mb-5 grid gap-4 rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm md:grid-cols-3">
                <div>
                    <span className="text-xs text-[#879590]">رابطه همکاری</span>

                    <strong className="mt-2 block text-sm text-[#183d36]">
                        {caseItem.engagementCode
                            ? `${caseItem.engagementCode} · فعال`
                            : 'رابطه همکاری ثبت نشده'}
                    </strong>
                </div>

                <div className="md:border-x md:border-[#e6ece9] md:px-5">
                    <span className="text-xs text-[#879590]">اقدام بعدی</span>

                    <strong className="mt-2 block text-sm leading-6 text-[#183d36]">
                        {caseItem.nextAction || 'اقدام بعدی ثبت نشده است'}
                    </strong>
                </div>

                <div>
                    <span className="text-xs text-[#879590]">
                        آخرین به‌روزرسانی
                    </span>

                    <LastUpdatedTime date={caseItem.updatedAt} />
                </div>
            </section>

            <CaseTabs activeTab={activeTab} onChange={handleTabChange} />

            {activeTab === 'overview' && (
                <OverviewContent
                    caseItem={caseItem}
                    onSelectTab={handleTabChange}
                />
            )}

            {activeTab === 'information' && (
                <CaseInformation caseItem={caseItem} />
            )}

            {activeTab === 'engagement' && (
                <CollaborationDetails caseItem={caseItem} />
            )}

            {activeTab === 'tasks' && <CaseTasks caseItem={caseItem} />}

            {activeTab === 'messages' && <CaseMessages caseItem={caseItem} />}

            {activeTab === 'meetings' && <CaseMeetings caseItem={caseItem} />}

            {activeTab === 'documents' && <CaseDocuments caseItem={caseItem} />}

            {activeTab === 'contract' && <CaseContract caseItem={caseItem} />}

            {activeTab === 'payments' && <CasePayments caseItem={caseItem} />}

            {activeTab === 'assistant' && <CaseAssistant caseItem={caseItem} />}
            {activeTab === 'history' && <CaseHistory caseItem={caseItem} />}
        </div>
    );
}
