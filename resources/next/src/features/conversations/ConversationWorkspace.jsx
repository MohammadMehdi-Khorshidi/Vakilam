'use client';

import { useEffect, useState } from 'react';

import ChatBox from '@/features/client/messages/ChatBox';
import ContactSidebar from '@/features/client/messages/ContactSidebar';
import {
    getConversation,
    listConversations,
    sendConversationMessage,
} from '@/lib/api/conversations';

export default function ConversationWorkspace() {
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        listConversations()
            .then(async (items) => {
                if (!mounted) return;

                setConversations(items);

                if (items.length > 0) {
                    const firstId = items[0].public_id;
                    setSelectedId(firstId);
                    const details = await getConversation(firstId);
                    if (mounted) setConversation(details);
                }
            })
            .catch((requestError) => {
                if (mounted) setError(requestError.message);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const selectConversation = async (publicId) => {
        if (!publicId || publicId === selectedId) return;

        setSelectedId(publicId);
        setLoading(true);
        setError('');

        try {
            setConversation(await getConversation(publicId));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (body) => {
        if (!conversation || sending) return false;

        setSending(true);
        setError('');

        try {
            const sentMessage = await sendConversationMessage(
                conversation.public_id,
                body,
            );

            setConversation((current) => ({
                ...current,
                messages: [...(current?.messages || []), sentMessage],
                last_message: sentMessage,
            }));

            setConversations((items) =>
                items.map((item) =>
                    item.public_id === conversation.public_id
                        ? { ...item, last_message: sentMessage }
                        : item,
                ),
            );

            return true;
        } catch (requestError) {
            setError(requestError.message);
            return false;
        } finally {
            setSending(false);
        }
    };

    if (loading && conversations.length === 0) {
        return (
            <div className="rounded-[18px] border border-[#dfe7e3] bg-white px-6 py-16 text-center text-[#71817c]">
                در حال بازیابی گفتگوها...
            </div>
        );
    }

    if (!loading && conversations.length === 0) {
        return (
            <div className="rounded-[18px] border border-[#dfe7e3] bg-white px-6 py-16 text-center">
                <h2 className="font-extrabold text-[#173f38]">
                    هنوز گفتگویی با وکیل فعال نشده است
                </h2>
                <p className="mt-3 leading-7 text-[#71817c]">
                    پس از رزرو مشاوره یا نهایی‌شدن همکاری با وکیل، گفتگو به‌صورت
                    خودکار در این بخش نمایش داده می‌شود.
                </p>
                {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {conversations.length > 1 && (
                <label className="block rounded-2xl border border-[#dfe7e3] bg-white p-4 text-sm font-bold text-[#173f38]">
                    انتخاب گفتگو
                    <select
                        value={selectedId}
                        onChange={(event) =>
                            selectConversation(event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-[#dce5e1] bg-[#fafcfb] px-4 py-3 font-normal outline-none focus:border-[#123f37]"
                    >
                        {conversations.map((item) => (
                            <option key={item.public_id} value={item.public_id}>
                                {item.context?.title || 'گفتگوی حقوقی'} —{' '}
                                {item.counterpart?.name || 'وکیل پرونده'}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
                <ContactSidebar conversation={conversation} />
                <ChatBox
                    conversation={conversation}
                    loading={loading}
                    sending={sending}
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
}
