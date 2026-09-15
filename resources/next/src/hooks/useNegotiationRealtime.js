'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getNegotiation } from '@/lib/api/negotiations';
import { getRealtimeEcho } from '@/lib/realtime';

const FALLBACK_SYNC_MS = 30_000;
const TYPING_IDLE_MS = 1_400;

export default function useNegotiationRealtime({
    negotiationId,
    enabled = true,
    currentUserId = null,
    onMessage,
    onSync,
}) {
    const [otherOnline, setOtherOnline] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const [syncError, setSyncError] = useState(false);

    const mountedRef = useRef(false);
    const channelRef = useRef(null);
    const echoRef = useRef(null);
    const typingTimerRef = useRef(null);
    const fallbackTimerRef = useRef(null);
    const syncingRef = useRef(false);
    const realtimeHealthyRef = useRef(false);

    const syncNegotiation = useCallback(async () => {
        if (!enabled || !negotiationId || syncingRef.current) return;

        syncingRef.current = true;
        try {
            const data = await getNegotiation(negotiationId);
            if (mountedRef.current) onSync?.(data);
        } catch {
            if (mountedRef.current) setSyncError(true);
        } finally {
            syncingRef.current = false;
        }
    }, [enabled, negotiationId, onSync]);

    const isOtherUser = useCallback(
        (user) =>
            Boolean(
                user?.id &&
                    (!currentUserId || user.id !== currentUserId),
            ),
        [currentUserId],
    );

    useEffect(() => {
        mountedRef.current = true;
        realtimeHealthyRef.current = false;

        if (!enabled || !negotiationId) {
            return () => {
                mountedRef.current = false;
            };
        }

        let cancelled = false;
        const channelName = `negotiation.${negotiationId}`;

        (async () => {
            try {
                const echo = await getRealtimeEcho();

                if (cancelled || !mountedRef.current) return;
                if (!echo) throw new Error('Realtime unavailable.');

                echoRef.current = echo;
                const channel = echo.join(channelName);
                channelRef.current = channel;

                channel
                    .here((members) => {
                        if (cancelled || !mountedRef.current) return;

                        realtimeHealthyRef.current = true;
                        setSyncError(false);
                        setOtherOnline(
                            Array.isArray(members) &&
                                members.some(isOtherUser),
                        );
                    })
                    .joining((member) => {
                        if (mountedRef.current && isOtherUser(member)) {
                            setOtherOnline(true);
                        }
                    })
                    .leaving((member) => {
                        if (mountedRef.current && isOtherUser(member)) {
                            setOtherOnline(false);
                            setOtherTyping(false);
                        }
                    })
                    .listen('.negotiation.message.sent', (event) => {
                        if (!mountedRef.current) return;

                        const message = event?.message;
                        if (!message?.id) return;

                        realtimeHealthyRef.current = true;
                        setSyncError(false);
                        onMessage?.(message);
                    })
                    .listenForWhisper('typing', (event) => {
                        if (!mountedRef.current) return;
                        if (
                            event?.user_public_id &&
                            currentUserId &&
                            event.user_public_id === currentUserId
                        ) {
                            return;
                        }

                        setOtherTyping(Boolean(event?.typing));
                    })
                    .error(() => {
                        if (!mountedRef.current) return;
                        realtimeHealthyRef.current = false;
                        setSyncError(true);
                    });
            } catch {
                if (!cancelled && mountedRef.current) {
                    realtimeHealthyRef.current = false;
                    setSyncError(true);
                    syncNegotiation();
                }
            }
        })();

        fallbackTimerRef.current = window.setInterval(() => {
            if (!realtimeHealthyRef.current) {
                syncNegotiation();
            }
        }, FALLBACK_SYNC_MS);

        return () => {
            cancelled = true;
            mountedRef.current = false;
            realtimeHealthyRef.current = false;

            if (typingTimerRef.current) {
                window.clearTimeout(typingTimerRef.current);
            }

            if (fallbackTimerRef.current) {
                window.clearInterval(fallbackTimerRef.current);
            }

            try {
                echoRef.current?.leave(channelName);
            } catch {}

            channelRef.current = null;
            echoRef.current = null;
        };
    }, [
        enabled,
        negotiationId,
        currentUserId,
        isOtherUser,
        onMessage,
        syncNegotiation,
    ]);

    const notifyTyping = useCallback(
        (typing = true) => {
            const channel = channelRef.current;

            if (channel) {
                try {
                    channel.whisper('typing', {
                        typing: Boolean(typing),
                        user_public_id: currentUserId,
                    });
                } catch {}
            }

            if (typingTimerRef.current) {
                window.clearTimeout(typingTimerRef.current);
            }

            if (typing) {
                typingTimerRef.current = window.setTimeout(() => {
                    try {
                        channelRef.current?.whisper('typing', {
                            typing: false,
                            user_public_id: currentUserId,
                        });
                    } catch {}
                }, TYPING_IDLE_MS);
            }
        },
        [currentUserId],
    );

    return {
        otherOnline,
        otherTyping,
        syncError,
        notifyTyping,
        refreshNow: syncNegotiation,
    };
}
