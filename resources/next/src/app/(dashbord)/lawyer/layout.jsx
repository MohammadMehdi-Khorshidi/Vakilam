'use client';

import { useState } from 'react';

import LawyerSidebar from '../../../components/dashboard/LawyerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AuthGuard from '@/auth/AuthGuard';

const ClientDashboardLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <AuthGuard roles={['lawyer']}>
        <div dir="rtl" className="min-h-screen bg-[#f8faf9]">
            {/* ================= Dashboard Layout ================= */}
            <div className="flex min-h-screen">
                {/* ================= Sidebar ================= */}
                <LawyerSidebar
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />

                {/* ================= Main Area ================= */}
                <div className="min-w-0 flex-1">
                    {/* Header */}
                    <DashboardHeader
                        mobileOpen={mobileOpen}
                        setMobileOpen={setMobileOpen}
                    />

                    {/* Page */}
                    <main className="min-h-[calc(100vh-80px)]">{children}</main>
                </div>
            </div>
        </div>
        </AuthGuard>
    );
};

export default ClientDashboardLayout;
