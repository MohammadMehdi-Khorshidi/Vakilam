import Link from 'next/link';

import NotificationStatus from './NotificationStatus';

const columns = ['عنوان', 'مخاطب', 'محرک', 'کانال', 'وضعیت', 'اقدام'];

function SettingsButton({ notificationId }) {
    return (
        <Link
            href={`/admin/notifications/${notificationId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d3dcd8] bg-white px-4 text-sm font-bold text-[#173e38] transition hover:border-[#b68a31] hover:bg-[#fffaf0]"
        >
            متن و تنظیمات
        </Link>
    );
}

export default function NotificationsTable({ notifications = [] }) {
    if (!notifications.length) {
        return (
            <section className="rounded-[22px] border border-[#dce5e1] bg-white p-8 text-center">
                <p className="text-sm text-[#71807b]">
                    اعلانی برای نمایش وجود ندارد.
                </p>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-[22px] border border-[#dce5e1] bg-white p-3 shadow-[0_8px_28px_rgba(20,61,52,0.06)] sm:p-5">
            {/* دسکتاپ */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px] border-collapse text-center">
                    <thead className="bg-[#fafbf9] text-sm font-semibold text-[#687a74]">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="whitespace-nowrap px-5 py-4"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {notifications.map((notification) => (
                            <tr
                                key={notification.id}
                                className="border-t border-[#dde5e1] text-sm text-[#253e39] transition hover:bg-[#fbfcfa]"
                            >
                                <td className="px-5 py-5 text-right">
                                    <Link
                                        href={`/admin/notifications/${notification.id}`}
                                        className="border-b border-[#c79631] font-bold text-[#155347]"
                                    >
                                        {notification.title}
                                    </Link>
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    {notification.audience}
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    {notification.trigger}
                                </td>

                                <td className="px-5 py-5">
                                    {notification.channel}
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    <NotificationStatus
                                        status={notification.status}
                                    />
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    <SettingsButton
                                        notificationId={notification.id}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* موبایل */}
            <div className="grid gap-3 md:hidden">
                {notifications.map((notification) => (
                    <article
                        key={notification.id}
                        className="rounded-2xl border border-[#e1e8e5] p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <Link
                                href={`/admin/notifications/${notification.id}`}
                                className="font-black leading-7 text-[#155347] underline decoration-[#c79631] underline-offset-4"
                            >
                                {notification.title}
                            </Link>

                            <NotificationStatus status={notification.status} />
                        </div>

                        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-xs text-[#84918d]">
                                    مخاطب
                                </dt>

                                <dd className="mt-1 font-medium">
                                    {notification.audience}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-[#84918d]">محرک</dt>

                                <dd className="mt-1 font-medium">
                                    {notification.trigger}
                                </dd>
                            </div>

                            <div className="col-span-2">
                                <dt className="text-xs text-[#84918d]">
                                    کانال
                                </dt>

                                <dd className="mt-1 font-medium">
                                    {notification.channel}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-5">
                            <SettingsButton notificationId={notification.id} />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
