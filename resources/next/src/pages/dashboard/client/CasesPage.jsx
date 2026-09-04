'use client';

import { Vazirmatn } from 'next/font/google';
import CaseHeader from '@/features/client/cases/CaseHeader';
import CaseStatus from '@/features/client/home/CaseStatus';
import CaseTabs from '@/features/client/cases/CaseTabs';
import CaseSummary from '@/features/client/cases/CaseSummary';
import CaseTimeline from '@/features/client/cases/CaseTimeline';
import RecentDocuments from '@/features/client/cases/RecentDocuments';
import UpcomingMeeting from '@/features/client/cases/UpcomingMeeting';



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

                <CaseStatus caseData={caseData} />

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
