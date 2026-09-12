'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
    getEcho,
    leaveNegotiationChannel,
    resetEcho,
} from '@/lib/realtime/echo';

export default function useNegotiationRealtime({
    negotiationId,
    currentUserPublicId,
    onMessage,
    onStateChanged,
}) {
    const [connectionState, setConnectionState] =
        useState('connecting');
    const [connectionError, setConnectionError] =
        useState('');
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
        setConnectionState('connecting');
        setConnectionError('');

        async function connect() {
            try {
                const echo = await getEcho();

                if (!echo || disposed) return;

                const pusher = echo.connector?.pusher;

                pusher?.connection?.bind(
                    'state_change',
                    (states) => {
                        if (disposed) return;

                        const current = states?.current;

                        if (current === 'connected') {
                            setConnectionState('connected');
                            setConnectionError('');
                        } else if (
                            ['failed', 'unavailable', 'disconnected'].includes(
                                current,
                            )
                        ) {
                            setConnectionState('error');
                            setConnectionError(
                                `WebSocket: ${current}`,
                            );
                        } else {
                            setConnectionState('connecting');
                        }
                    },
                );

                pusher?.connection?.bind('error', (error) => {
                    if (disposed) return;

                    setConnectionState('error');
                    setConnectionError(
                        error?.error?.data?.message ||
                            error?.error?.message ||
                            error?.message ||
                            'WebSocket connection failed',
                    );
                });

                const channel = echo.join(
                    `negotiation.${negotiationId}`,
                );

                channelRef.current = channel;

                channel
                    .here((members) => {
                        if (disposed) return;

                        setConnectionState('connected');
                        setConnectionError('');

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
                    .error((error) => {
                        if (disposed) return;

                        setConnectionState('error');
                        setConnectionError(
                            error?.message ||
                                error?.error ||
                                `Presence auth failed${
                                    error?.status
                                        ? ` (${error.status})`
                                        : ''
                                }`,
                        );
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
            } catch (error) {
                if (disposed) return;

                resetEcho();
                setConnectionState('error');
                setConnectionError(
                    error?.message ||
                        'Realtime connection failed',
                );
            }
        }

        connect();

        return () => {
            disposed = true;
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
        connected: connectionState === 'connected',
        connectionState,
        connectionError,
        otherOnline,
        otherTyping,
        notifyTyping,
    };
}
