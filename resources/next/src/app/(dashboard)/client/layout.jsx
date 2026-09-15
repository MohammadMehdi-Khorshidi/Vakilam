'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import ClientSidebar from '../../../components/sidebar/ClientSidebar';
import DashboardAuthGuard from '../../../components/auth/DashboardAuthGuard';

export default function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <DashboardAuthGuard requiredRole="client">
            <div dir="rtl" className="min-h-screen bg-[#f7faf8]">
                <div className="flex min-h-screen">
                    <ClientSidebar
                        mobileOpen={mobileOpen}
                        setMobileOpen={setMobileOpen}
                    />

                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            aria-label="باز کردن منو"
                            className="fixed right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-[#d6e3df] bg-white text-[#174c42] shadow-sm lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <main className="min-h-screen">{children}</main>
                    </div>
                </div>
            </div>
        </DashboardAuthGuard>
    );
}
