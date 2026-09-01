// 'use client';
//
// import { useParams } from 'next/navigation';
// import { useEffect, useState } from 'react';
//
// import { Vazirmatn } from 'next/font/google';
//
// import CaseHeader from '@/components/pages/dashboard/client/(cases)/CaseHeader';
// import CaseStats from '@/components/pages/dashboard/client/(cases)/CaseStats';
// import CaseTabs from '@/components/pages/dashboard/client/(cases)/CaseTabs';
// import CaseSummary from '@/components/pages/dashboard/client/(cases)/CaseSummary';
// import CaseTimeline from '@/components/pages/dashboard/client/(cases)/CaseTimeline';
// import RecentDocuments from '@/components/pages/dashboard/client/(cases)/RecentDocuments';
// import UpcomingMeeting from '@/components/pages/dashboard/client/(sessions)/UpcomingMeeting';
//
// const vazirmatn = Vazirmatn({
//     subsets: ['arabic'],
//     display: 'swap',
// });
//
// const CasePage = () => {
//     const params = useParams();
//
//     const legalMatterId =
//         params?.legal_matter_id ||
//         params?.caseId ||
//         params?.id;
//
//     const [caseData, setCaseData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//
//     useEffect(() => {
//         const getCase = async () => {
//             try {
//                 setLoading(true);
//                 setError('');
//
//                 if (!legalMatterId) {
//                     setError('شناسه پرونده پیدا نشد.');
//                     return;
//                 }
//
//                 const token =
//                     localStorage.getItem('auth_token');
//
//                 if (!token) {
//                     setError(
//                         'برای مشاهده پرونده باید وارد حساب کاربری شوید.'
//                     );
//                     return;
//                 }
//
//                 const response = await fetch(
//                     `http://127.0.0.1:8000/api/client/cases/${legalMatterId}`,
//                     {
//                         method: 'GET',
//                         headers: {
//                             Accept: 'application/json',
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );
//
//                 const data = await response.json();
//
//                 console.log(
//                     'Case Details Response:',
//                     data
//                 );
//
//                 if (response.status === 401) {
//                     setError(
//                         'احراز هویت انجام نشد. دوباره وارد حساب شوید.'
//                     );
//                     return;
//                 }
//
//                 if (!response.ok) {
//                     setError(
//                         data.message ||
//                         'دریافت اطلاعات پرونده ناموفق بود.'
//                     );
//                     return;
//                 }
//
//                 /*
//                  * بسته به ساختار Response بک‌اند،
//                  * اطلاعات ممکن است داخل data باشد.
//                  */
//
//                 const caseResult =
//                     data.data || data;
//
//                 setCaseData(caseResult);
//             } catch (err) {
//                 console.error(
//                     'Case Details Error:',
//                     err
//                 );
//
//                 setError(
//                     'ارتباط با سرور برقرار نشد.'
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         getCase();
//     }, [legalMatterId]);
//
//     // =========================
//     // Loading
//     // =========================
//
//     if (loading) {
//         return (
//             <main
//                 dir="rtl"
//                 className={`${vazirmatn.className} flex min-h-screen items-center justify-center bg-[#f7faf8]`}
//             >
//                 <div className="text-center">
//                     <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dfe7e4] border-t-[#123c35]" />
//
//                     <p className="mt-4 text-[14px] font-semibold text-[#123c35]">
//                         در حال دریافت اطلاعات پرونده...
//                     </p>
//                 </div>
//             </main>
//         );
//     }
//
//     // =========================
//     // Error
//     // =========================
//
//     if (error) {
//         return (
//             <main
//                 dir="rtl"
//                 className={`${vazirmatn.className} flex min-h-screen items-center justify-center bg-[#f7faf8] px-5`}
//             >
//                 <div className="w-full max-w-[500px] rounded-[20px] border border-[#ead9d9] bg-white p-8 text-center shadow-sm">
//                     <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
//                         !
//                     </div>
//
//                     <h2 className="mt-4 text-[18px] font-extrabold text-[#123c35]">
//                         خطا در دریافت پرونده
//                     </h2>
//
//                     <p className="mt-3 text-[13px] leading-7 text-[#7c8985]">
//                         {error}
//                     </p>
//                 </div>
//             </main>
//         );
//     }
//
//     if (!caseData) {
//         return null;
//     }
//
//     // =========================
//     // Dashboard Case
//     // =========================
//
//     return (
//         <main
//             dir="rtl"
//             className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
//         >
//             <div className="mx-auto mt-12 max-w-[1280px] px-5 py-7">
//
//                 <CaseHeader
//                     caseData={caseData}
//                 />
//
//                 <CaseStats
//                     caseData={caseData}
//                 />
//
//                 <CaseTabs />
//
//                 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//
//                     <CaseSummary
//                         summary={caseData.summary}
//                     />
//
//                     <CaseTimeline
//                         items={caseData.timeline || []}
//                     />
//
//                     <RecentDocuments
//                         documents={caseData.documents || []}
//                     />
//
//                     <UpcomingMeeting
//                         meeting={caseData.nextMeeting}
//                     />
//
//                 </div>
//             </div>
//         </main>
//     );
// };
//
// export default CasePage;


'use client';

import { Vazirmatn } from 'next/font/google';

import CaseHeader from '@/components/pages/dashboard/client/(cases)/CaseHeader';
import CaseStats from '@/components/pages/dashboard/client/(cases)/CaseStats';
import CaseTabs from '@/components/pages/dashboard/client/(cases)/CaseTabs';
import CaseSummary from '@/components/pages/dashboard/client/(cases)/CaseSummary';
import CaseTimeline from '@/components/pages/dashboard/client/(cases)/CaseTimeline';
import RecentDocuments from '@/components/pages/dashboard/client/(cases)/RecentDocuments';
import UpcomingMeeting from '@/components/pages/dashboard/client/(sessions)/UpcomingMeeting';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const CasePage = () => {
    // فعلاً اطلاعات تستی برای نمایش UI
    const caseData = {
        title: 'مطالبه وجه چک',
        code: 'VK-1405-00128',
        type: 'پرونده حقوقی',
        status: 'در حال انتخاب وکیل',

        managementHealth: 78,

        stage: 'شروع همکاری',

        lawyerName: 'نگرس سعادتی',

        paymentStatus: 'پیش‌پرداخت ثبت‌نشده',

        summary:
            'موکل یک فقره چک به مبلغ ۸۲۰ میلیون تومان در اختیار دارد که در سررسید پرداخت نشده است. گواهی عدم پرداخت دریافت شده و موکل قصد مطالبه وجه و جبران خسارت تأخیر را دارد.',

        timeline: [
            {
                id: 1,
                title: 'پرونده تشکیل شد',
                date: '۲۱ تیر ۱۴۰۵',
            },
            {
                id: 2,
                title: 'وکیل انتخاب شد',
                date: '۲۲ تیر ۱۴۰۵',
            },
            {
                id: 3,
                title: 'پیش‌پرداخت ثبت شد',
                date: '۲۲ تیر ۱۴۰۵',
            },
            {
                id: 4,
                title: 'قرارداد تأیید شد',
                date: 'امروز',
            },
            {
                id: 5,
                title: 'شروع همکاری',
                date: 'در حال انجام',
            },
        ],

        documents: [
            {
                id: 1,
                title: 'قرارداد-ثبت‌شده.pdf',
                category: 'محرمانه · تأییدشده',
                status: 'نهایی',
            },
            {
                id: 2,
                title: 'گواهی عدم پرداخت.jpg',
                category: 'مدرک بانکی',
                status: 'بررسی‌شده',
            },
        ],

        nextMeeting: {
            day: '۲۶',
            title: 'جلسه بررسی راهبرد پرونده',
            time: '۱۷:۰۰',
            date: 'سه‌شنبه، ۲۶ تیر',
        },
    };

    return (
        <main
            dir="rtl"
            className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
        >
            <div className="mx-auto mt-12 max-w-[1280px] px-5 py-7">
                <CaseHeader caseData={caseData} />

                <CaseStats caseData={caseData} />

                <CaseTabs />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <CaseSummary summary={caseData.summary} />

                    <CaseTimeline items={caseData.timeline} />

                    <RecentDocuments documents={caseData.documents} />

                    <UpcomingMeeting meeting={caseData.nextMeeting} />
                </div>
            </div>
        </main>
    );
};

export default CasePage;
