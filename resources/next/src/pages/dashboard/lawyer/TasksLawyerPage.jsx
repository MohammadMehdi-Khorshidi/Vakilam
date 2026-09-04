'use client';

import { useMemo } from 'react';

import { tasks } from '../../../features/lawyer/tasks/tasksData';
import TaskOverviewItem from '@/features/lawyer/tasks/TaskOverviewItem';

const statusPriority = {
    in_progress: 1,
    waiting_client: 2,
    scheduled: 3,
    completed: 4,
};

export default function TasksLawyerPage() {
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((firstTask, secondTask) => {
            const firstPriority = statusPriority[firstTask.status] ?? 5;

            const secondPriority = statusPriority[secondTask.status] ?? 5;

            if (firstPriority !== secondPriority) {
                return firstPriority - secondPriority;
            }

            return (
                new Date(firstTask.dueAt).getTime() -
                new Date(secondTask.dueAt).getTime()
            );
        });
    }, []);

    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <header className="mb-8 pt-4">


                <h1 className="mt-5 text-3xl font-black leading-tight text-[#0b302b] sm:text-4xl">
                    وظایف تجمیعی همه پرونده‌ها
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#75847f]">
                    هر کار به پرونده مشخص متصل است؛ جزئیات و تاریخچه از داخل
                    همان پرونده دیده می‌شود.
                </p>
            </header>

            <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                {sortedTasks.length ? (
                    <div className="space-y-3">
                        {sortedTasks.map((task) => (
                            <TaskOverviewItem key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="py-14 text-center">
                        <p className="text-sm text-[#879590]">
                            هنوز کاری برای نمایش وجود ندارد.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
