'use client';

import { CalendarPlus, Phone, Video, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import useCurrentDateTime from '@/hooks/useCurrentDateTime';
import MeetingCard from '@/components/pages/dashboard/lawyer/(cases)/(caseCode)/(meetings)/MeetingCard';

function createMeetingId() {
    return `MTG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toDateTimeLocal(date) {
    const pad = (value) => String(value).padStart(2, '0');

    return [
        date.getFullYear(),
        '-',
        pad(date.getMonth() + 1),
        '-',
        pad(date.getDate()),
        'T',
        pad(date.getHours()),
        ':',
        pad(date.getMinutes()),
    ].join('');
}

function getDefaultMeetingTime() {
    const date = new Date();

    date.setHours(date.getHours() + 1);

    const roundedMinutes = Math.ceil(date.getMinutes() / 15) * 15;

    date.setMinutes(roundedMinutes, 0, 0);

    return toDateTimeLocal(date);
}

function formatPersianDateTime(date) {
    if (!date) {
        return 'زمان نامشخص';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'زمان نامعتبر';
    }

    return parsedDate.toLocaleString('fa-IR', {
        calendar: 'persian',
        dateStyle: 'full',
        timeStyle: 'short',
    });
}

export default function CaseMeetings({ caseItem }) {
    const currentDate = useCurrentDateTime();

    const storageKey = `vakilam-case-meetings-${caseItem.code}`;

    const [meetings, setMeetings] = useState(caseItem.meetings ?? []);

    const [isLoaded, setIsLoaded] = useState(false);

    const [showForm, setShowForm] = useState(true);

    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const [form, setForm] = useState(() => ({
        title: '',
        type: 'voice',
        startsAt: getDefaultMeetingTime(),
    }));

    const minimumMeetingTime = toDateTimeLocal(currentDate);

    useEffect(() => {
        try {
            const storedMeetings = window.localStorage.getItem(storageKey);

            if (storedMeetings) {
                const parsedMeetings = JSON.parse(storedMeetings);

                if (Array.isArray(parsedMeetings)) {
                    setMeetings(parsedMeetings);
                }
            }
        } catch {
            setMeetings(caseItem.meetings ?? []);
        } finally {
            setIsLoaded(true);
        }
    }, [caseItem.meetings, storageKey]);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(meetings));
    }, [isLoaded, meetings, storageKey]);

    const sortedMeetings = useMemo(() => {
        return [...meetings].sort(
            (firstMeeting, secondMeeting) =>
                new Date(secondMeeting.startsAt).getTime() -
                new Date(firstMeeting.startsAt).getTime(),
        );
    }, [meetings]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const selectedDate = new Date(form.startsAt);

        const now = new Date();

        if (!form.title.trim() || !form.startsAt) {
            return;
        }

        if (Number.isNaN(selectedDate.getTime()) || selectedDate <= now) {
            window.alert('تاریخ جلسه باید بعد از زمان فعلی باشد.');

            return;
        }

        const newMeeting = {
            id: createMeetingId(),
            title: form.title.trim(),
            type: form.type,
            status: 'scheduled',
            startsAt: selectedDate.toISOString(),
            createdAt: now.toISOString(),
        };

        setMeetings((currentMeetings) => [...currentMeetings, newMeeting]);

        setForm({
            title: '',
            type: 'voice',
            startsAt: getDefaultMeetingTime(),
        });

        setShowForm(false);
    }

    function handleDeleteMeeting(meetingId) {
        const confirmed = window.confirm('آیا از حذف این جلسه مطمئن هستید؟');

        if (!confirmed) {
            return;
        }

        setMeetings((currentMeetings) =>
            currentMeetings.filter((meeting) => meeting.id !== meetingId),
        );

        setSelectedMeeting(null);
    }

    return (
        <div className="space-y-5">
            <section>
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#123b34]">
                            جلسات همین پرونده
                        </h2>

                        <p className="mt-2 text-sm text-[#879590]">
                            {meetings.length.toLocaleString('fa-IR')} جلسه ثبت
                            شده است.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowForm((current) => !current)}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#d8b45d] bg-[#fffaf0] px-4 py-3 text-sm font-bold text-[#183d36] transition hover:bg-[#fff5dc]"
                    >
                        {showForm ? (
                            <X size={18} />
                        ) : (
                            <CalendarPlus size={18} />
                        )}

                        {showForm ? 'بستن فرم' : 'ثبت جلسه'}
                    </button>
                </div>

                {sortedMeetings.length ? (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {sortedMeetings.map((meeting) => (
                            <MeetingCard
                                key={meeting.id}
                                meeting={meeting}
                                onView={setSelectedMeeting}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-[#dce6e2] bg-white py-14 text-center">
                        <CalendarPlus
                            size={28}
                            className="mx-auto text-[#8fa09a]"
                        />

                        <p className="mt-3 text-sm text-[#879590]">
                            هنوز جلسه‌ای ثبت نشده است.
                        </p>
                    </div>
                )}
            </section>

            {showForm && (
                <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                    <header className="border-b border-[#edf1ef] pb-5">
                        <h2 className="text-xl font-bold text-[#123b34]">
                            ثبت جلسه برای همین پرونده
                        </h2>

                        <div className="mt-4 rounded-xl border border-[#e3eae7] bg-[#fafcfb] px-4 py-3">
                            <span className="text-xs text-[#879590]">
                                تاریخ و ساعت فعلی:
                            </span>

                            <strong className="mr-2 text-sm text-[#183d36]">
                                {formatPersianDateTime(currentDate)}
                            </strong>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="mt-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label>
                                <span className="mb-2 block text-xs font-bold text-[#657571]">
                                    عنوان جلسه
                                </span>

                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="بررسی مدارک تکمیلی"
                                    required
                                    className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition placeholder:text-[#9aa6a2] focus:border-[#0b5648]"
                                />
                            </label>

                            <label>
                                <span className="mb-2 block text-xs font-bold text-[#657571]">
                                    نوع جلسه
                                </span>

                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition focus:border-[#0b5648]"
                                >
                                    <option value="voice">
                                        تماس صوتی داخل وکیلم
                                    </option>

                                    <option value="video">
                                        تماس تصویری داخل وکیلم
                                    </option>
                                </select>
                            </label>

                            <label className="md:col-span-2">
                                <span className="mb-2 block text-xs font-bold text-[#657571]">
                                    تاریخ و ساعت جلسه
                                </span>

                                <input
                                    type="datetime-local"
                                    name="startsAt"
                                    value={form.startsAt}
                                    min={minimumMeetingTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition focus:border-[#0b5648]"
                                />

                                <span className="mt-2 block text-xs text-[#879590]">
                                    جلسه باید بعد از زمان فعلی ثبت شود.
                                </span>
                            </label>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-xl bg-[#0b5648] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073f35]"
                            >
                                ثبت جلسه
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {selectedMeeting && (
                <MeetingModal
                    meeting={selectedMeeting}
                    onClose={() => setSelectedMeeting(null)}
                    onDelete={() => handleDeleteMeeting(selectedMeeting.id)}
                />
            )}
        </div>
    );
}

function MeetingModal({ meeting, onClose, onDelete }) {
    const TypeIcon = meeting.type === 'video' ? Video : Phone;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#123b34]">
                            {meeting.title}
                        </h2>

                        <p className="mt-2 text-sm text-[#75847f]">
                            شناسه {meeting.id}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="بستن"
                        className="grid size-9 place-items-center rounded-lg border border-[#dce6e2] transition hover:bg-[#f5f8f6]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-6 rounded-xl border border-[#e3eae7] bg-[#fafcfb] p-4">
                    <span className="inline-flex items-center gap-2 text-sm font-bold">
                        <TypeIcon size={18} />

                        {meeting.type === 'video'
                            ? 'تماس تصویری داخل وکیلم'
                            : 'تماس صوتی داخل وکیلم'}
                    </span>

                    <time
                        dateTime={meeting.startsAt}
                        className="mt-3 block text-sm text-[#657571]"
                    >
                        {formatPersianDateTime(meeting.startsAt)}
                    </time>
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            window.alert('ورود نمایشی به جلسه انجام شد.')
                        }
                        className="flex-1 rounded-xl bg-[#0b5648] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073f35]"
                    >
                        ورود به جلسه
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                    >
                        حذف
                    </button>
                </div>
            </div>
        </div>
    );
}
