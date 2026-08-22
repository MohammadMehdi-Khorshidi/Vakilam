'use client';

import { useState } from 'react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ClientSidebar from '@/components/dashboard/ClientSidebar';

const ClientDashboardLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div dir="rtl" className="min-h-screen bg-[#f8faf9]">
            {/* Sidebar */}
            <ClientSidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main */}
            <div className="min-h-screen lg:pr-[280px]">
                <DashboardHeader
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />

                <main>{children}</main>
            </div>
        </div>
    );
};

export default ClientDashboardLayout;
