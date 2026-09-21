'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';

import useAuthenticatedUser from '@/hooks/useAuthenticatedUser';
import {
    listNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from '@/lib/api/notifications';
import { getRealtimeEcho } from '@/lib/realtime';

function formatDate(value) {
    if (!value) return '';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    } catch {
        return '';
    }
}

export default function DashboardNotifications() {
    const user = useAuthenticatedUser();
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [pushNotice, setPushNotice] = useState(null);
    const toastTimer = useRef(null);

    const load = useCallback(async () => {
        try {
            const response = await listNotifications(20);
            setItems(response?.data ?? []);
            setUnreadCount(Number(response?.meta?.unread_count ?? 0));
        } catch {
            // Notifications must not break the dashboard.
        }
    }, []);

    useEffect(() => {
        load();
        const timer = window.setInterval(load, 60_000);
        return () => window.clearInterval(timer);
    }, [load]);

    useEffect(() => {
        if (!user?.public_id) return undefined;

        let cancelled = false;
        let echo = null;
        const channelName = `user.${user.public_id}`;

        (async () => {
            try {
                echo = await getRealtimeEcho();
                if (!echo || cancelled) return;

                echo.private(channelName)
                    .listen('.user.notification.created', (event) => {
                        if (cancelled || !event?.notification) return;

                        const notification = event.notification;
                        setItems((current) => [
                            notification,
                            ...current.filter((item) => item.id !== notification.id),
                        ].slice(0, 20));
                        setUnreadCount((count) => count + 1);
                        setPushNotice(notification);

                        if (toastTimer.current) {
                            window.clearTimeout(toastTimer.current);
                        }

                        toastTimer.current = window.setTimeout(
                            () => setPushNotice(null),
                            6500,
                        );
                    });
            } catch {
                // 60-second REST refresh remains as a recovery path.
            }
        })();

        return () => {
            cancelled = true;
            if (toastTimer.current) window.clearTimeout(toastTimer.current);
            try { echo?.leave(channelName); } catch {}
        };
    }, [user?.public_id]);

    const readOne = async (item) => {
        if (item.status !== 'unread') return;

        setItems((current) =>
            current.map((row) =>
                row.id === item.id
                    ? { ...row, status: 'read', read_at: new Date().toISOString() }
                    : row,
            ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));

        try {
            await markNotificationRead(item.id);
        } catch {
            load();
        }
    };

    const readAll = async () => {
        setItems((current) =>
            current.map((item) => ({
                ...item,
                status: 'read',
                read_at: item.read_at || new Date().toISOString(),
            })),
        );
        setUnreadCount(0);

        try {
            await markAllNotificationsRead();
        } catch {
            load();
        }
    };

    return (
        <>
            <div className="fixed left-4 top-4 z-30">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-label="اعلان‌ها"
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#d6e3df] bg-white text-[#174c42] shadow-sm"
                >
                    <Bell size={20} />
                    {unreadCount > 0 ? (
                        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#b98a31] px-1 text-[10px] font-black text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    ) : null}
                </button>

                {open ? (
                    <div
                        dir="rtl"
                        className="mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-[#dbe5e1] bg-white shadow-[0_18px_60px_rgba(17,63,54,0.18)]"
                    >
                        <div className="flex items-center justify-between border-b border-[#edf1ef] px-4 py-3">
                            <div>
                                <p className="font-black text-[#173f38]">اعلان‌ها</p>
                                <p className="mt-1 text-[11px] text-[#81908b]">
                                    تغییرات مهم حساب و فعالیت‌های مدیریت
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={readAll}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#9a762c]"
                            >
                                <CheckCheck size={15} />
                                خواندن همه
                            </button>
                        </div>

                        <div className="max-h-[460px] overflow-y-auto">
                            {items.length ? (
                                items.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => readOne(item)}
                                        className={`block w-full border-b border-[#f0f3f2] px-4 py-3 text-right transition hover:bg-[#f7faf8] ${
                                            item.status === 'unread' ? 'bg-[#f2f8f5]' : 'bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {item.status === 'unread' ? (
                                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#b98a31]" />
                                            ) : null}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-extrabold text-[#284f46]">
                                                    {item.title}
                                                </p>
                                                {item.body ? (
                                                    <p className="mt-1 text-xs leading-6 text-[#6f807a]">
                                                        {item.body}
                                                    </p>
                                                ) : null}
                                                <p className="mt-1 text-[10px] text-[#9aa6a2]">
                                                    {formatDate(item.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="px-4 py-10 text-center text-sm text-[#899691]">
                                    اعلانی ندارید.
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {pushNotice ? (
                <div
                    dir="rtl"
                    className="fixed left-16 top-4 z-[60] w-[min(80vw,360px)] rounded-2xl border border-[#d8e4df] bg-white p-4 shadow-[0_18px_60px_rgba(17,63,54,0.2)]"
                >
                    <button
                        type="button"
                        onClick={() => setPushNotice(null)}
                        className="absolute left-3 top-3 text-[#87958f]"
                    >
                        <X size={16} />
                    </button>
                    <p className="pl-6 text-sm font-black text-[#173f38]">
                        {pushNotice.title}
                    </p>
                    {pushNotice.body ? (
                        <p className="mt-2 text-xs leading-6 text-[#6f807a]">
                            {pushNotice.body}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
