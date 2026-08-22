'use client';

import Image from 'next/image';

import { Vazirmatn } from 'next/font/google';
import HeaderIcon from '@/assets/images/HeaderIcon.svg';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '700'],
});

const Footer = () => {
    const menuItems = ['خانه', 'تیم‌ها', 'بلاگ', 'ارتباط با ما', 'درباره ما'];

    return (
        <footer
            className={`${vazir.className} w-full bg-[#e8f1ee] px-6 py-8 text-[#2C3639] md:px-30`}
        >
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                {[
                    'وکلای حرفه‌ای',
                    'مناسب با بودجه شما',
                    'کیفیت بالای خدمات',
                ].map((text, i) => (
                    <div
                        key={i}
                        className="flex h-[48px] w-[220px] items-center justify-center rounded-xl bg-[#28685c] px-3 shadow-sm"
                    >
                        <span className="text-sm font-medium text-white">
                            {text}
                        </span>
                    </div>
                ))}
            </div>

            <div className="my-8 h-[1px] w-full bg-white" />

            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

                <div className="flex gap-3">
                    <div className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white shadow-sm transition hover:bg-[#0E9A8A]">
                        <svg
                            className="h-4 w-4 text-[#2C3639] group-hover:text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle
                                cx="17.5"
                                cy="6.5"
                                r="1"
                                fill="currentColor"
                                stroke="none"
                            />
                        </svg>
                    </div>

                    <div className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white shadow-sm transition hover:bg-[#0E9A8A]">
                        <svg
                            className="h-4 w-4 text-[#2C3639] group-hover:text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.964 6.817H1.683l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </div>

                    <div className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white shadow-sm transition hover:bg-[#0E9A8A]">
                        <svg
                            className="h-4 w-4 text-[#2C3639] group-hover:text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M6.94 8.5H3.5V20h3.44V8.5zM5.22 3A2.02 2.02 0 103.2 5a2.02 2.02 0 002.02-2zM20.5 13.4c0-3.46-1.84-5.07-4.3-5.07-1.98 0-2.86 1.09-3.35 1.86V8.5H9.42V20h3.43v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.42v-6.6z" />
                        </svg>
                    </div>
                </div>

                <div className="hidden gap-5 text-sm font-medium md:flex">
                    {menuItems.map((item) => (
                        <span
                            key={item}
                            className="cursor-pointer transition hover:text-[#0E9A8A]"
                        >
                            {item}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:hidden">
                    {menuItems.map((item) => (
                        <span key={item}>{item}</span>
                    ))}
                </div>

                <div className="text-lg font-bold">
                    <Image
                        src={HeaderIcon}
                        alt="Vakili Logo"
                        width={95}
                        height={40}
                        priority
                    />
                </div>
            </div>

            <div className="my-8 h-[1px] w-full bg-white" />

            <div className="flex flex-col justify-between gap-6 md:flex-row">
                <div className="flex gap-3 text-right">
                    <div className="flex flex-col gap-3 text-sm">
                        <div>۰۹۸۷۵۶۵۳۴۶۳</div>
                        <div>تهران، خیابان مثال</div>
                    </div>
                    <div className="flex flex-col gap-3 text-[#0E9A8A]">
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 5a2 2 0 012-2h2l2 5-2 2a11 11 0 005 5l2-2 5 2v2a2 2 0 01-2 2h-1C9 20 4 15 4 8V7a2 2 0 012-2z" />
                        </svg>

                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10z" />
                        </svg>
                    </div>
                </div>

                <div className="max-w-sm text-right">
                    <h3 className="mb-1 font-bold">چرا وکیلم؟</h3>
                    <p className="text-sm leading-6">
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
