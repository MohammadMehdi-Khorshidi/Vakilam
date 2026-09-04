'use client';

import { CalendarClock, History } from 'lucide-react';
import { useMemo } from 'react';
import HistoryItem from './HistoryItem';


export default function CaseHistory({ caseItem }) {
    const sortedActivities = useMemo(() => {
        return [...(caseItem.activities ?? [])]
            .filter((activity) => {
                if (!activity.occurredAt) {
                    return false;
                }

                return !Number.isNaN(new Date(activity.occurredAt).getTime());
            })
            .sort(
                (firstActivity, secondActivity) =>
                    new Date(secondActivity.occurredAt).getTime() -
                    new Date(firstActivity.occurredAt).getTime(),
            );
    }, [caseItem.activities]);

    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="flex flex-col justify-between gap-4 border-b border-[#edf1ef] pb-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-[#edf6f2] text-[#0b5648]">
                        <History size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#123b34]">
                            تاریخچه یکپارچه پرونده و همکاری
                        </h2>

                        <p className="mt-1 text-xs text-[#879590]">
                            رویدادهای پرونده {caseItem.code}
                        </p>
                    </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce6e2] bg-[#fafcfb] px-4 py-2 text-xs font-bold text-[#657571]">
                    <CalendarClock size={16} />
                    {sortedActivities.length.toLocaleString('fa-IR')} رویداد
                </div>
            </header>

            {sortedActivities.length ? (
                <div className="mt-6">
                    {sortedActivities.map((activity, index) => (
                        <HistoryItem
                            key={activity.id}
                            activity={activity}
                            isLast={index === sortedActivities.length - 1}
                            caseCode={caseItem.code}
                            engagementCode={caseItem.engagementCode}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid min-h-64 place-items-center text-center">
                    <div>
                        <History size={34} className="mx-auto text-[#94a09d]" />

                        <p className="mt-3 text-sm text-[#879590]">
                            هنوز رویدادی برای این پرونده ثبت نشده است.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
