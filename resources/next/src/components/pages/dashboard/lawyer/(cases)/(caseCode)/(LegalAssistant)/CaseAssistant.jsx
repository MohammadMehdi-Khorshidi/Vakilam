'use client';

import { Bot } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';

import AssistantActionCard from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(LegalAssistant)/AssistantActionCard';

import AssistantControls from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(LegalAssistant)/AssistantControls';

import AssistantResult from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(LegalAssistant)/AssistantResult';

import AssistantSources from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(LegalAssistant)/AssistantSources';

import {
    assistantActions,
    legalSources,
} from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(LegalAssistant)/assistantData';

import {
    createCaseSummary,
    createLegalDraft,
    filterLegalSources,
} from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(LegalAssistant)/assistantUtils';

function getStoredHistory(storageKey) {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const storedHistory = window.localStorage.getItem(storageKey);

        if (!storedHistory) {
            return [];
        }

        const parsedHistory = JSON.parse(storedHistory);

        if (Array.isArray(parsedHistory)) {
            return parsedHistory;
        }
    } catch {
        // Ignore invalid localStorage data.
    }

    return [];
}

function subscribeToHistory(storageKey, callback) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handleStorageChange = (event) => {
        if (event.key === storageKey || event.key === null) {
            callback();
        }
    };

    const handleCustomChange = (event) => {
        if (event.detail?.storageKey === storageKey) {
            callback();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    window.addEventListener(
        'vakilam-assistant-history-change',
        handleCustomChange,
    );

    return () => {
        window.removeEventListener('storage', handleStorageChange);

        window.removeEventListener(
            'vakilam-assistant-history-change',
            handleCustomChange,
        );
    };
}

function saveHistoryToStorage(storageKey, history) {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(history));

        window.dispatchEvent(
            new CustomEvent('vakilam-assistant-history-change', {
                detail: {
                    storageKey,
                },
            }),
        );
    } catch {
        // Ignore localStorage errors.
    }
}

function createHistoryItem(type, content) {
    const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `AI-${Math.random().toString(36).slice(2, 12)}`;

    const createdAt =
        typeof performance !== 'undefined' &&
        typeof performance.timeOrigin === 'number'
            ? new Date(performance.timeOrigin + performance.now()).toISOString()
            : '';

    return {
        id: `AI-${id}`,
        type,
        title: content.title,
        createdAt,
    };
}

export default function CaseAssistant({ caseItem }) {
    const storageKey = `vakilam-case-assistant-${caseItem.code}`;

    const history = useSyncExternalStore(
        (callback) => subscribeToHistory(storageKey, callback),
        () => getStoredHistory(storageKey),
        () => [],
    );

    const [activeAction, setActiveAction] = useState(null);

    const [result, setResult] = useState(null);

    const [searchText, setSearchText] = useState('');

    const [isCopied, setIsCopied] = useState(false);

    const filteredSources = useMemo(
        () => filterLegalSources(legalSources, searchText),
        [searchText],
    );

    function saveToHistory(type, content) {
        const newHistoryItem = createHistoryItem(type, content);

        saveHistoryToStorage(storageKey, [newHistoryItem, ...history]);
    }

    function handleAction(actionId) {
        setActiveAction(actionId);
        setIsCopied(false);

        if (actionId === 'summary') {
            const summary = createCaseSummary(caseItem);

            setResult(summary);

            saveToHistory('summary', summary);

            return;
        }

        if (actionId === 'draft') {
            const draft = createLegalDraft(caseItem);

            setResult(draft);

            saveToHistory('draft', draft);

            return;
        }

        setResult(null);
    }

    async function handleCopy() {
        if (!result?.text) {
            return;
        }

        try {
            await navigator.clipboard.writeText(result.text);

            setIsCopied(true);

            window.setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch {
            window.alert('کپی متن در این مرورگر انجام نشد.');
        }
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
                <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                    <header className="border-b border-[#edf1ef] pb-5">
                        <div className="flex items-center gap-3">
                            <div className="grid size-11 place-items-center rounded-xl bg-[#edf6f2] text-[#0b5648]">
                                <Bot size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-[#123b34]">
                                    دستیار حقوقی پرونده {caseItem.code}
                                </h2>

                                <p className="mt-1 text-xs text-[#879590]">
                                    ابزار کمکی وکیل برای همین پرونده
                                </p>
                            </div>
                        </div>
                    </header>

                    <p className="mt-5 text-sm leading-8 text-[#657571]">
                        دستیار فقط از اطلاعات همین پرونده برای خلاصه‌سازی، تهیه
                        پیش‌نویس و جست‌وجوی منابع استفاده می‌کند.
                    </p>

                    <div className="mt-5 space-y-3">
                        {assistantActions.map((action) => (
                            <AssistantActionCard
                                key={action.id}
                                action={action}
                                isActive={activeAction === action.id}
                                onClick={() => handleAction(action.id)}
                            />
                        ))}
                    </div>
                </section>

                <AssistantControls history={history} />
            </div>

            {activeAction === 'sources' && (
                <AssistantSources
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    sources={filteredSources}
                    onClose={() => setActiveAction(null)}
                />
            )}

            {result && (
                <AssistantResult
                    result={result}
                    isCopied={isCopied}
                    onCopy={handleCopy}
                    onChange={(text) =>
                        setResult((currentResult) => ({
                            ...currentResult,
                            text,
                        }))
                    }
                    onClose={() => {
                        setResult(null);
                        setActiveAction(null);
                    }}
                />
            )}
        </div>
    );
}
