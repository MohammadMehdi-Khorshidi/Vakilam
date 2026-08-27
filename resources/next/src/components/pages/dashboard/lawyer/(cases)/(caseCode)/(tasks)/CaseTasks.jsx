'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import TaskItem from './TaskItem';


function createTaskId(tasks) {
    const taskNumbers = tasks
        .map((task) => Number(task.id?.replace('TSK-', '')))
        .filter((number) => Number.isFinite(number));

    const nextNumber = taskNumbers.length ? Math.max(...taskNumbers) + 1 : 101;

    return `TSK-${nextNumber}`;
}

export default function CaseTasks({ caseItem }) {
    const [tasks, setTasks] = useState(caseItem.tasks ?? []);

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: '',
        assignee: 'وکیل',
        dueAt: '',
        status: 'scheduled',
    });

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((firstTask, secondTask) => {
            if (
                firstTask.status === 'completed' &&
                secondTask.status !== 'completed'
            ) {
                return 1;
            }

            if (
                firstTask.status !== 'completed' &&
                secondTask.status === 'completed'
            ) {
                return -1;
            }

            return (
                new Date(firstTask.dueAt).getTime() -
                new Date(secondTask.dueAt).getTime()
            );
        });
    }, [tasks]);

    function handleInputChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!form.title.trim() || !form.dueAt) {
            return;
        }

        const newTask = {
            id: createTaskId(tasks),
            title: form.title.trim(),
            assignee: form.assignee,
            status: form.status,
            dueAt: new Date(form.dueAt).toISOString(),
            createdAt: new Date().toISOString(),
        };

        setTasks((currentTasks) => [...currentTasks, newTask]);

        setForm({
            title: '',
            assignee: 'وکیل',
            dueAt: '',
            status: 'scheduled',
        });

        setShowForm(false);
    }

    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="flex flex-col justify-between gap-4 border-b border-[#edf1ef] pb-5 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#123b34]">
                        کارهای همین پرونده
                    </h2>

                    <p className="mt-2 text-sm text-[#879590]">
                        {tasks.length.toLocaleString('fa-IR')} کار برای این
                        پرونده ثبت شده است.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowForm((current) => !current)}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#d8b45d] bg-[#fffaf0] px-4 py-3 text-sm font-bold text-[#183d36] transition hover:bg-[#fff5dc]"
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}

                    {showForm ? 'بستن فرم' : 'افزودن کار'}
                </button>
            </header>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-5 rounded-xl border border-[#e3eae7] bg-[#fafcfb] p-5"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="md:col-span-2">
                            <span className="mb-2 block text-xs font-bold text-[#657571]">
                                عنوان کار
                            </span>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleInputChange}
                                placeholder="مثلاً بررسی قرارداد پایه"
                                required
                                className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition focus:border-[#0b5648]"
                            />
                        </label>

                        <label>
                            <span className="mb-2 block text-xs font-bold text-[#657571]">
                                مسئول
                            </span>

                            <select
                                name="assignee"
                                value={form.assignee}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition focus:border-[#0b5648]"
                            >
                                <option value="وکیل">وکیل</option>

                                <option value="موکل">موکل</option>
                            </select>
                        </label>

                        <label>
                            <span className="mb-2 block text-xs font-bold text-[#657571]">
                                وضعیت
                            </span>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition focus:border-[#0b5648]"
                            >
                                <option value="scheduled">
                                    برنامه‌ریزی‌شده
                                </option>

                                <option value="in_progress">
                                    در حال انجام
                                </option>

                                <option value="completed">انجام‌شده</option>
                            </select>
                        </label>

                        <label className="md:col-span-2">
                            <span className="mb-2 block text-xs font-bold text-[#657571]">
                                مهلت انجام
                            </span>

                            <input
                                type="datetime-local"
                                name="dueAt"
                                value={form.dueAt}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition focus:border-[#0b5648]"
                            />
                        </label>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="submit"
                            className="rounded-xl bg-[#0b5648] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073f35]"
                        >
                            ثبت کار
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-5 space-y-3">
                {sortedTasks.length ? (
                    sortedTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-[#dce6e2] py-12 text-center">
                        <p className="text-sm text-[#879590]">
                            هنوز کاری برای این پرونده ثبت نشده است.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
