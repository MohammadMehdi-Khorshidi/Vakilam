'use client';

import { useState } from 'react';
import Image from 'next/image';
import HeaderIcon from '@/assets/images/HeaderIcon.svg';
import ButtonHeader from '@/components/common/ButtonHeader';
import { useAuthSession } from '@/hooks/useAuthenticatedUser';
import { dashboardForUser } from '@/lib/api/auth';

export default function Header() {
    const [open, setOpen] = useState(false);
    const { authenticated, user } = useAuthSession();
    const accountHref = authenticated ? dashboardForUser(user) : '/login';
    const accountLabel = authenticated ? 'داشبورد من' : 'ثبت نام / ورود';

    const menuItems = [
        { label: 'تیم‌ما', path: '/teams' },
        { label: 'ارتباط با ما', path: '/contact' },
        { label: 'درباره ما', path: '/about' },
        { label: 'خانه', path: '/' },
    ];

    return (
        <header dir="ltr" className="z-100 sticky top-0 bg-white shadow-lg">
            <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:h-20 lg:px-0">
                <div className="hidden items-center gap-2 lg:flex">
                    <ButtonHeader variant="primary" href={accountHref}>
                        {accountLabel}
                    </ButtonHeader>
                </div>

                <nav className="hidden items-center gap-2 text-[#123c35] lg:flex">
                    {menuItems.map((item, i) => (
                        <ButtonHeader key={i} variant="" href={item.path}>
                            {item.label}
                        </ButtonHeader>
                    ))}
                </nav>

                <div className="flex items-center">
                    <Image
                        src={HeaderIcon}
                        alt="Vakili Logo"
                        width={95}
                        height={40}
                    />
                </div>

                <button
                    onClick={() => setOpen(!open)}
                    className="flex flex-col gap-1.5 lg:hidden"
                >
                    <span className="h-[2px] w-5 bg-[#123c35]" />
                    <span className="h-[2px] w-5 bg-[#123c35]" />
                    <span className="h-[2px] w-5 bg-[#123c35]" />
                </button>
            </div>

            {open && (
                <div className="flex flex-col gap-2 bg-white px-4 pb-5 text-[#123c35] shadow-md lg:hidden">
                    {menuItems.map((item, i) => (
                        <ButtonHeader
                            key={i}
                            variant="ghost"
                            href={item.path}
                            full
                        >
                            {item.label}
                        </ButtonHeader>
                    ))}

                    <div className="flex flex-col gap-2 pt-2">
                        <ButtonHeader
                            variant="primary"
                            full
                            href={authenticated ? accountHref : '/login'}
                        >
                            شرح مسئله حقوقی
                        </ButtonHeader>

                        <ButtonHeader
                            variant="ghost"
                            full
                            href={accountHref}
                        >
                            {accountLabel}
                        </ButtonHeader>
                    </div>
                </div>
            )}
        </header>
    );
}
