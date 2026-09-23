'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, UserPlus, UsersRound } from 'lucide-react';

import { getAdmins, getAdminUsers, setAdminRole } from '@/lib/api/admin';
import AdminSearchBox from '@/features/admin/shared/AdminSearchBox';
import { faDate, roleLabel, statusLabel } from '@/features/admin/shared/adminFormat';

export default function AdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState('');
    const [reasons, setReasons] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState('');

    const loadAdmins = useCallback(async () => {
        setAdmins(await getAdmins());
    }, []);

    useEffect(() => {
        loadAdmins().catch((error) => setMessage(error.message));
    }, [loadAdmins]);

    useEffect(() => {
        const q = search.trim();
        if (q.length < 2) {
            setCandidates([]);
            return undefined;
        }

        const timer = window.setTimeout(async () => {
            try {
                const rows = await getAdminUsers({ search: q });
                setCandidates(rows);
            } catch (error) {
                setMessage(error.message);
            }
        }, 300);

        return () => window.clearTimeout(timer);
    }, [search]);

    const adminIds = useMemo(() => new Set(admins.map((item) => item.id)), [admins]);
    const availableCandidates = candidates.filter(
        (item) => !adminIds.has(item.id) && !(item.roles ?? []).includes('super_admin'),
    );

    const changeRole = async (user, enabled) => {
        setBusy(user.id);
        setMessage('');
        try {
            await setAdminRole(user.id, enabled, reasons[user.id] || '');
            setReasons((current) => ({ ...current, [user.id]: '' }));
            await loadAdmins();
            if (enabled) setCandidates((current) => current.filter((item) => item.id !== user.id));
            setMessage(enabled
                ? 'دسترسی ادمین فعال شد و به کاربر اعلان ارسال شد.'
                : 'دسترسی ادمین لغو شد و به کاربر اعلان ارسال شد.');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setBusy('');
        }
    };

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174c42] text-[#e1c477]">
                    <ShieldCheck size={23} />
                </span>
                <div>
                    <h1 className="text-3xl font-black text-[#10382f]">مدیران سامانه</h1>
                    <p className="mt-2 text-sm leading-7 text-[#788883]">
                        سوپر ادمین می‌تواند کاربران موجود را به ادمین تبدیل کند یا دسترسی ادمین را لغو کند.
                    </p>
                </div>
            </div>

            <section className="mt-6 rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                    <UserPlus size={19} className="text-[#9d772e]" />
                    <h2 className="font-black text-[#174c42]">افزودن ادمین جدید</h2>
                </div>
                <p className="mt-2 text-xs leading-6 text-[#7e8d88]">
                    نام یا شماره موبایل کاربر را جستجو کن. ساخت سوپر ادمین جدید همچنان فقط از CLI انجام می‌شود.
                </p>

                <AdminSearchBox
                    value={search}
                    onChange={setSearch}
                    placeholder="جستجو با نام یا شماره موبایل..."
                    className="mt-4 max-w-xl"
                />

                {search.trim().length >= 2 ? (
                    <div className="mt-4 grid gap-3">
                        {availableCandidates.map((user) => (
                            <div key={user.id} className="grid gap-4 rounded-2xl border border-[#e0e8e4] bg-[#fbfdfc] p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                                <div>
                                    <p className="font-black text-[#264e45]">{user.name}</p>
                                    <p className="mt-1 text-xs text-[#7e8d88]">{user.phone}</p>
                                </div>
                                <input
                                    value={reasons[user.id] || ''}
                                    onChange={(event) => setReasons((current) => ({
                                        ...current,
                                        [user.id]: event.target.value,
                                    }))}
                                    placeholder="توضیح اعطای دسترسی (اختیاری)"
                                    className="min-h-11 rounded-xl border border-[#d7e2dd] bg-white px-3 text-sm outline-none focus:border-[#aec8bf]"
                                />
                                <button
                                    type="button"
                                    disabled={busy === user.id}
                                    onClick={() => changeRole(user, true)}
                                    className="min-h-11 rounded-xl bg-[#174c42] px-5 text-sm font-black text-white disabled:opacity-50"
                                >
                                    {busy === user.id ? 'در حال ثبت...' : 'ادمین کردن'}
                                </button>
                            </div>
                        ))}
                        {!availableCandidates.length ? (
                            <p className="py-5 text-center text-sm text-[#87958f]">
                                کاربر عادی مطابق جستجو پیدا نشد.
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </section>

            {message ? (
                <div className="mt-4 rounded-2xl border border-[#dbe6e1] bg-white px-4 py-3 text-sm font-bold text-[#31564d]">
                    {message}
                </div>
            ) : null}

            <section className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                    <UsersRound size={19} className="text-[#9d772e]" />
                    <h2 className="font-black text-[#174c42]">مدیران فعلی</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {admins.map((user) => {
                        const isSuper = (user.roles ?? []).includes('super_admin');
                        return (
                            <article key={user.id} className="flex min-h-[250px] flex-col rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-black text-[#174c42]">{user.name}</h3>
                                        <p className="mt-1 text-sm text-[#71827c]">{user.phone}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-[11px] font-black ${isSuper ? 'bg-[#fff5dc] text-[#8a671d]' : 'bg-[#eef6f3] text-[#31564d]'}`}>
                                        {isSuper ? 'سوپر ادمین' : 'ادمین'}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-xl bg-[#f7faf8] p-3">
                                        <span className="text-[#8a9792]">وضعیت</span>
                                        <p className="mt-1 font-black text-[#31564d]">{statusLabel(user.status)}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#f7faf8] p-3">
                                        <span className="text-[#8a9792]">آخرین ورود</span>
                                        <p className="mt-1 font-black text-[#31564d]">{faDate(user.last_login_at)}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4">
                                    {isSuper ? (
                                        <p className="rounded-xl bg-[#fff9eb] px-3 py-2 text-xs leading-6 text-[#85661f]">
                                            دسترسی سوپر ادمین از این صفحه قابل لغو نیست.
                                        </p>
                                    ) : (
                                        <>
                                            <input
                                                value={reasons[user.id] || ''}
                                                onChange={(event) => setReasons((current) => ({
                                                    ...current,
                                                    [user.id]: event.target.value,
                                                }))}
                                                placeholder="دلیل لغو دسترسی (اختیاری)"
                                                className="min-h-10 w-full rounded-xl border border-[#d7e2dd] px-3 text-xs outline-none"
                                            />
                                            <button
                                                type="button"
                                                disabled={busy === user.id}
                                                onClick={() => changeRole(user, false)}
                                                className="mt-2 min-h-10 w-full rounded-xl bg-red-600 px-4 text-xs font-black text-white disabled:opacity-50"
                                            >
                                                لغو دسترسی ادمین
                                            </button>
                                        </>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
