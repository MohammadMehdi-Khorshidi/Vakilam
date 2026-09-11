'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
    getEcho,
    leaveNegotiationChannel,
} from '@/lib/realtime/echo';

export default function useNegotiationRealtime({
    negotiationId,
    currentUserPublicId,
    onMessage,
    onStateChanged,
}) {
    const [connected, setConnected] = useState(false);
    const [otherOnline, setOtherOnline] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const channelRef = useRef(null);
    const typingTimerRef = useRef(null);
    const remoteTypingTimerRef = useRef(null);

    useEffect(() => {
        if (!negotiationId || !currentUserPublicId) {
            return undefined;
        }

        let disposed = false;

        async function connect() {
            try {
                const echo = await getEcho();
                if (!echo || disposed) return;

                const channel = echo.join(
                    `negotiation.${negotiationId}`,
                );
                channelRef.current = channel;

                channel
                    .here((members) => {
                        if (disposed) return;
                        setConnected(true);
                        setOtherOnline(
                            (members || []).some(
                                (member) =>
                                    member?.id !==
                                    currentUserPublicId,
                            ),
                        );
                    })
                    .joining((member) => {
                        if (
                            !disposed &&
                            member?.id !== currentUserPublicId
                        ) {
                            setOtherOnline(true);
                        }
                    })
                    .leaving((member) => {
                        if (
                            !disposed &&
                            member?.id !== currentUserPublicId
                        ) {
                            setOtherOnline(false);
                            setOtherTyping(false);
                        }
                    })
                    .listen(
                        '.negotiation.message.sent',
                        (event) => {
                            if (!disposed) {
                                onMessage?.(event?.message);
                            }
                        },
                    )
                    .listen(
                        '.negotiation.state.changed',
                        (event) => {
                            if (!disposed) {
                                onStateChanged?.(event?.change);
                            }
                        },
                    )
                    .listenForWhisper('typing', (event) => {
                        if (
                            disposed ||
                            event?.user_id ===
                                currentUserPublicId
                        ) {
                            return;
                        }

                        setOtherTyping(Boolean(event?.typing));

                        if (remoteTypingTimerRef.current) {
                            clearTimeout(
                                remoteTypingTimerRef.current,
                            );
                        }

                        if (event?.typing) {
                            remoteTypingTimerRef.current =
                                setTimeout(
                                    () =>
                                        setOtherTyping(false),
                                    1800,
                                );
                        }
                    });
            } catch {
                if (!disposed) setConnected(false);
            }
        }

        connect();

        return () => {
            disposed = true;
            setConnected(false);
            setOtherOnline(false);
            setOtherTyping(false);

            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
            if (remoteTypingTimerRef.current) {
                clearTimeout(
                    remoteTypingTimerRef.current,
                );
            }

            channelRef.current = null;
            leaveNegotiationChannel(negotiationId);
        };
    }, [
        negotiationId,
        currentUserPublicId,
        onMessage,
        onStateChanged,
    ]);

    const notifyTyping = useCallback(
        (typing = true) => {
            const channel = channelRef.current;
            if (!channel || !currentUserPublicId) return;

            channel.whisper('typing', {
                user_id: currentUserPublicId,
                typing,
            });

            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }

            if (typing) {
                typingTimerRef.current = setTimeout(() => {
                    channelRef.current?.whisper('typing', {
                        user_id: currentUserPublicId,
                        typing: false,
                    });
                }, 1100);
            }
        },
        [currentUserPublicId],
    );

    return {
        connected,
        otherOnline,
        otherTyping,
        notifyTyping,
    };
}
