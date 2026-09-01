// 'use client';
//
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
//
// import HomeIntro from './(home)/HomeIntro';
// import LegalProblemBox from './(home)/LegalProblemBox';
// import ActiveCase from './(home)/ActiveCase';
// import DashboardStats from './(home)/DashboardStats';
// import QuickActions from './(home)/QuickActions';
// import NextSteps from './(home)/NextSteps';
// import CaseStatus from './(home)/CaseStatus';
// import SmartBox from './(home)/SmartBox';
// import ActionsCenter from './(home)/ActionsCenter';
//
// const ClientHomePage = () => {
//     const router = useRouter();
//
//     const [dashboard, setDashboard] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//
//     useEffect(() => {
//         const getDashboard = async () => {
//             try {
//                 setLoading(true);
//                 setError('');
//
//                 // =========================
//                 // گرفتن Token
//                 // =========================
//
//                 const token = localStorage.getItem('auth_token');
//
//                 // اگر Token نداریم
//                 if (!token) {
//                     setError(
//                         'برای مشاهده داشبورد ابتدا وارد حساب کاربری شوید.',
//                     );
//
//                     setTimeout(() => {
//                         router.push('/login');
//                     }, 1200);
//
//                     return;
//                 }
//
//                 // =========================
//                 // Dashboard API
//                 // =========================
//
//                 const response = await fetch(
//                     'http://127.0.0.1:8000/api/client/dashboard',
//                     {
//                         method: 'GET',
//
//                         headers: {
//                             Accept: 'application/json',
//                             Authorization: `Bearer ${token}`,
//                         },
//                     },
//                 );
//
//                 const data = await response.json();
//
//                 console.log('Client Dashboard Response:', data);
//
//                 // =========================
//                 // Unauthorized
//                 // =========================
//
//                 if (response.status === 401) {
//                     localStorage.removeItem('auth_token');
//
//                     setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
//
//                     setTimeout(() => {
//                         router.push('/login');
//                     }, 1200);
//
//                     return;
//                 }
//
//                 // =========================
//                 // Other Errors
//                 // =========================
//
//                 if (!response.ok) {
//                     setError(
//                         data.message || 'دریافت اطلاعات داشبورد ناموفق بود.',
//                     );
//
//                     return;
//                 }
//
//                 // =========================
//                 // Success
//                 // =========================
//
//                 setDashboard(data);
//             } catch (err) {
//                 console.error('Client Dashboard Error:', err);
//
//                 setError('ارتباط با سرور برقرار نشد.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         getDashboard();
//     }, [router]);
//
//     // =========================
//     // Loading
//     // =========================
//
//     if (loading) {
//         return (
//             <div
//                 dir="rtl"
//                 className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f8faf9]"
//             >
//                 <div className="text-center">
//                     <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dfe7e4] border-t-[#123c35]" />
//
//                     <p className="mt-4 text-[14px] font-semibold text-[#123c35]">
//                         در حال دریافت اطلاعات داشبورد...
//                     </p>
//                 </div>
//             </div>
//         );
//     }
//
//     // =========================
//     // Error
//     // =========================
//
//     if (error) {
//         return (
//             <div
//                 dir="rtl"
//                 className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f8faf9] px-5"
//             >
//                 <div className="w-full max-w-[500px] rounded-[20px] border border-[#ead9d9] bg-white p-8 text-center shadow-sm">
//                     <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
//                         !
//                     </div>
//
//                     <h2 className="mt-4 text-[18px] font-extrabold text-[#123c35]">
//                         خطا در دریافت اطلاعات
//                     </h2>
//
//                     <p className="mt-3 text-[13px] leading-7 text-[#7c8985]">
//                         {error}
//                     </p>
//
//                     <button
//                         type="button"
//                         onClick={() => router.push('/login')}
//                         className="mt-6 h-[48px] w-full rounded-[12px] bg-[#123c35] text-[13px] font-bold text-white transition hover:bg-[#1c554a]"
//                     >
//                         ورود به حساب کاربری
//                     </button>
//                 </div>
//             </div>
//         );
//     }
//
//     // =========================
//     // Dashboard
//     // =========================
//
//     return (
//         <div dir="rtl" className="min-h-[calc(100vh-80px)] bg-[#f8faf9]">
//             <div className="py-15 mx-auto max-w-[1400px] px-5 lg:px-8">
//                 {/* =========================
//                     Page Intro
//                 ========================== */}
//
//                 <HomeIntro dashboard={dashboard} />
//
//                 {/* =========================
//                     Legal Problem
//                 ========================== */}
//
//                 <LegalProblemBox dashboard={dashboard} />
//
//                 {/* =========================
//                     Active Case
//                 ========================== */}
//
//                 <ActiveCase dashboard={dashboard} />
//
//                 {/* =========================
//                     Stats
//                 ========================== */}
//
//                 <div className="mt-4">
//                     <DashboardStats dashboard={dashboard} />
//                 </div>
//
//                 {/* =========================
//                     Quick Actions
//                 ========================== */}
//
//                 <div className="mt-4">
//                     <QuickActions dashboard={dashboard} />
//                 </div>
//
//                 {/* =========================
//                     Next Steps + Case Status
//                 ========================== */}
//
//                 <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
//                     <NextSteps dashboard={dashboard} />
//
//                     <CaseStatus dashboard={dashboard} />
//                 </div>
//
//                 {/* =========================
//                     Smart Box + Actions Center
//                 ========================== */}
//
//                 <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
//                     <SmartBox dashboard={dashboard} />
//
//                     <ActionsCenter dashboard={dashboard} />
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default ClientHomePage;


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
            <div className="py-15 mx-auto max-w-[1400px] px-5 lg:px-8">
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
