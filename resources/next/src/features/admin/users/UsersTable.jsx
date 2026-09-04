import Link from 'next/link';

import UserStatusBadge from './UserStatusBadge';

export default function UsersTable({ users }) {
    if (!users.length) {
        return (
            <div className="rounded-2xl border border-[#dce4df] bg-white px-5 py-16 text-center shadow-[0_8px_25px_rgba(15,52,45,0.05)]">
                <h2 className="text-lg font-black text-[#173b34]">
                    کاربری پیدا نشد
                </h2>

                <p className="mt-2 text-sm text-[#7d8983]">
                    در حال حاضر هیچ کاربری برای نمایش وجود ندارد.
                </p>
            </div>
        );
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white p-4 shadow-[0_8px_25px_rgba(15,52,45,0.05)] md:p-5">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-right text-sm">
                    <thead>
                        <tr className="bg-[#f8faf8] text-xs text-[#66736d]">
                            <th className="rounded-r-xl p-4 font-medium">
                                نام
                            </th>

                            <th className="p-4 font-medium">نقش</th>

                            <th className="p-4 font-medium">وضعیت</th>

                            <th className="p-4 font-medium">پرونده‌ها</th>

                            <th className="rounded-l-xl p-4 text-center font-medium">
                                اقدام
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-[#e1e7e3] transition last:border-b-0 hover:bg-[#fafcfb]"
                            >
                                <td className="p-4">
                                    <Link
                                        href={`/admin/users/${encodeURIComponent(
                                            user.id,
                                        )}`}
                                        className="font-bold text-[#17483e] underline decoration-[#c7a252] decoration-1 underline-offset-4 transition hover:text-[#b18431]"
                                    >
                                        {user.name}
                                    </Link>
                                </td>

                                <td className="p-4 text-[#344840]">
                                    {user.role}
                                </td>

                                <td className="p-4">
                                    <UserStatusBadge status={user.status} />
                                </td>

                                <td className="p-4">
                                    <span className="font-bold text-[#273f38]">
                                        {user.casesCount.toLocaleString(
                                            'fa-IR',
                                        )}
                                    </span>

                                    <span className="mr-1 text-xs text-[#77847e]">
                                        پرونده
                                    </span>
                                </td>

                                <td className="p-4 text-center">
                                    <Link
                                        href={`/admin/usersAdmin/${encodeURIComponent(user.id)}`}
                                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d2dcd7] bg-white px-4 text-sm font-bold text-[#17483e] transition hover:border-[#b99449] hover:bg-[#fbf8f0]"
                                    >
                                        جزئیات کامل
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
