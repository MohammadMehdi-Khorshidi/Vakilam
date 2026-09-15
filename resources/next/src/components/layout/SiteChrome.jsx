'use client';

import { usePathname } from 'next/navigation';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SiteChrome({ children }) {
    const pathname = usePathname();
    const isDashboard =
        pathname === '/client' ||
        pathname?.startsWith('/client/') ||
        pathname === '/lawyer' ||
        pathname?.startsWith('/lawyer/');

    if (isDashboard) return children;

    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
