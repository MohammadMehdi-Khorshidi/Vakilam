'use client';

import Link from 'next/link';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '700'],
});

const ButtonHeader = ({
    variant = 'primary',
    children,
    href,
    large = false,
    full = false,
}) => {
    const base =
        'inline-flex items-center justify-center gap-2 min-h-[43px] px-[18px] py-[10px] rounded-[12px] text-[14px] font-medium transition-all duration-200 hover:-translate-y-[1px]';

    const variants = {
        primary:
            'text-white bg-[linear-gradient(145deg,#1c554a,#0d302a)] shadow-[0_9px_20px_#123c352e] hover:shadow-[0_13px_27px_#123c3540]',

        secondary:
            'text-[#123c35] border border-[#d3b776] bg-[#fcf9f1] hover:bg-[#f8f1e2]',

        ghost: 'text-[#123c35] border border-[#d5ddd9] bg-white hover:border-[#cfe0da] hover:bg-[#f3f8f6]',

        gold: 'text-[#08231f] bg-[linear-gradient(145deg,#d4b66f,#c5a35a)] shadow-[0_9px_22px_#c5a35a38]',
    };

    const size = large
        ? 'min-h-[52px] px-[25px] rounded-[14px] text-[15px]'
        : '';

    const width = full ? 'w-full' : '';

    const classes = `${base} ${variants[variant]} ${size} ${width} ${vazir.className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return <button className={classes}>{children}</button>;
};

export default ButtonHeader;
