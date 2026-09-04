import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import UserStatusBadge from './UserStatusBadge';

export default function UserDetailsHeader({ user }) {
    return (
        <header className="mb-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-3xl font-black leading-tight text-[#10382f] md:text-4xl">
                        {user.name}
                    </h1>

                    <p className="mt-3 text-sm text-[#7b8882]">
                        {user.role}
                        <span className="mx-2">·</span>
                        وضعیت{' '}
                        {user.status === 'active' ? 'فعال' : 'نیازمند بررسی'}
                    </p>
                </div>

                <UserStatusBadge status={user.status} />
            </div>
        </header>
    );
}
