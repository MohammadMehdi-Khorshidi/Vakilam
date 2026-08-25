'use client';

import HomeIntro from './(home)/HomeIntro';
import LegalProblemBox from './(home)/LegalProblemBox';
import ActiveCase from './(home)/ActiveCase';
import DashboardStats from './(home)/DashboardStats';
import QuickActions from './(home)/QuickActions';
import NextSteps from './(home)/NextSteps';
import CaseStatus from './(home)/CaseStatus';
import SmartBox from './(home)/SmartBox';
import ActionsCenter from './(home)/ActionsCenter';

const ClientHomePage = () => {
    return (
        <div dir="rtl" className="min-h-[calc(100vh-80px)] bg-[#f8faf9]">
            <div className="mx-auto max-w-[1400px] px-5 py-15 lg:px-8">
                {/* =========================
                    Page Intro
                ========================== */}
                <HomeIntro />

                {/* =========================
                    Legal Problem
                ========================== */}
                <LegalProblemBox />

                {/* =========================
                    Active Case
                ========================== */}
                <ActiveCase />

                {/* =========================
                    Stats
                ========================== */}
                <div className="mt-4">
                    <DashboardStats />
                </div>

                {/* =========================
                    Quick Actions
                ========================== */}
                <div className="mt-4">
                    <QuickActions />
                </div>

                {/* =========================
                    Next Steps + Case Status
                ========================== */}
                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <NextSteps />
                    <CaseStatus />
                </div>

                {/* =========================
                    Smart Box + Actions Center
                ========================== */}
                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <SmartBox />
                    <ActionsCenter />
                </div>
            </div>
        </div>
    );
};

export default ClientHomePage;
