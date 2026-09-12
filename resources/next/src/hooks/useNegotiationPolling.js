'use client';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { getNegotiation } from '@/lib/api/negotiations';
import { touchNegotiationPresence } from '@/lib/api/negotiationPresence';

export default function useNegotiationPolling({
    negotiationId,
    enabled = true,
    onSync,
}) {
    const [otherOnline, setOtherOnline] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const [syncError, setSyncError] = useState(false);

    const mountedRef = useRef(false);
    const typingRef = useRef(false);
    const typingTimerRef = useRef(null);
    const syncingRef = useRef(false);

    const syncNegotiation = useCallback(async () => {
        if (
            !enabled ||
            !negotiationId ||
            syncingRef.current
        ) {
            return;
        }

        syncingRef.current = true;

        try {
            const data = await getNegotiation(
                negotiationId,
            );

            if (mountedRef.current) {
                onSync?.(data);
                setSyncError(false);
            }
        } catch {
            if (mountedRef.current) {
                setSyncError(true);
            }
        } finally {
            syncingRef.current = false;
        }
    }, [enabled, negotiationId, onSync]);

    const heartbeat = useCallback(async () => {
        if (!enabled || !negotiationId) return;

        try {
            const data =
                await touchNegotiationPresence(
                    negotiationId,
                    typingRef.current,
                );

            if (!mountedRef.current) return;

            setOtherOnline(
                Boolean(data?.other?.online),
            );
            setOtherTyping(
                Boolean(data?.other?.typing),
            );
        } catch {
            if (mountedRef.current) {
                setOtherOnline(false);
                setOtherTyping(false);
            }
        }
    }, [enabled, negotiationId]);

    useEffect(() => {
        mountedRef.current = true;

        if (!enabled || !negotiationId) {
            return () => {
                mountedRef.current = false;
            };
        }

        syncNegotiation();
        heartbeat();

        const syncTimer = window.setInterval(
            syncNegotiation,
            1000,
        );

        const heartbeatTimer = window.setInterval(
            heartbeat,
            2000,
        );

        return () => {
            mountedRef.current = false;
            window.clearInterval(syncTimer);
            window.clearInterval(heartbeatTimer);

            if (typingTimerRef.current) {
                window.clearTimeout(
                    typingTimerRef.current,
                );
            }
        };
    }, [
        enabled,
        negotiationId,
        syncNegotiation,
        heartbeat,
    ]);

    const notifyTyping = useCallback(
        (typing = true) => {
            typingRef.current = Boolean(typing);

            heartbeat();

            if (typingTimerRef.current) {
                window.clearTimeout(
                    typingTimerRef.current,
                );
            }

            if (typing) {
                typingTimerRef.current =
                    window.setTimeout(() => {
                        typingRef.current = false;
                        heartbeat();
                    }, 1400);
            }
        },
        [heartbeat],
    );

    return {
        otherOnline,
        otherTyping,
        syncError,
        notifyTyping,
        refreshNow: syncNegotiation,
    };
}
