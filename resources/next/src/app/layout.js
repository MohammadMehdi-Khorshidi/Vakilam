import './globals.css';

import { Vazirmatn } from 'next/font/google';
import SiteChrome from '@/components/layout/SiteChrome';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-vazir',
    display: 'swap',
    preload: false,
});

export const metadata = {
    title: 'وکیلم',
    description: 'وکیلم',
    icons: { icon: '/logo.svg' },
};

export default function RootLayout({ children }) {
    return (
        <html lang="fa">
            <body className={`min-h-screen ${vazir.className} ${vazir.variable}`}>
                <SiteChrome>{children}</SiteChrome>
            </body>
        </html>
    );
}
