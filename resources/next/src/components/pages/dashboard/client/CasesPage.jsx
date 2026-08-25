'use client';

import { useParams } from 'next/navigation';

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
            <div className="mx-auto max-w-[1280px] mt-12 px-5 py-7">
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
