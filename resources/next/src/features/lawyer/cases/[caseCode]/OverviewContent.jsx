import {
    Bot,
    BriefcaseBusiness,
    CheckSquare,
    FileSignature,
    FileText,
    MessageSquare,
} from 'lucide-react';


import RecentActivities from './RecentActivities';
import StatCard from '../StatCard';
import InfoBox from './InfoBox';
import ActionButton from './ActionButton';

export default function OverviewContent({ caseItem, onSelectTab }) {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={BriefcaseBusiness}
                    title="سلامت مدیریت پرونده"
                    value={`${caseItem.health}٪`}
                    description="وضعیت مدیریت پرونده"
                />

                <StatCard
                    icon={MessageSquare}
                    title="پیام خوانده‌نشده"
                    value={caseItem.unreadMessages}
                />

                <StatCard
                    icon={CheckSquare}
                    title="کار عقب‌افتاده"
                    value={caseItem.pendingTasks}
                />

                <StatCard
                    icon={FileSignature}
                    title="وضعیت قرارداد"
                    value={caseItem.contractStatus}
                />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                    <h2 className="border-b border-[#edf1ef] pb-4 text-lg font-bold">
                        خلاصه پرونده
                    </h2>

                    <p className="mt-5 text-sm leading-8 text-[#63736f]">
                        {caseItem.description}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <InfoBox label="دسته‌بندی" value={caseItem.category} />

                        <InfoBox label="شهر" value={caseItem.city} />

                        <InfoBox label="فوریت" value={caseItem.urgency} />

                        <InfoBox
                            label="رابطه همکاری"
                            value={caseItem.engagementCode}
                        />
                    </div>
                </section>

                <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                    <h2 className="border-b border-[#edf1ef] pb-4 text-lg font-bold">
                        مرکز اقدام همین پرونده
                    </h2>

                    <div className="mt-5 rounded-xl border border-[#ead3a1] bg-[#fffaf0] p-5">
                        <span className="text-xs text-[#a97b2c]">
                            اقدام بعدی وکیل
                        </span>

                        <strong className="mt-2 block text-sm leading-7">
                            {caseItem.nextAction}
                        </strong>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <ActionButton
                            icon={CheckSquare}
                            label="کارها"
                            tab="tasks"
                            onSelectTab={onSelectTab}
                        />

                        <ActionButton
                            icon={FileSignature}
                            label="قرارداد"
                            tab="contract"
                            onSelectTab={onSelectTab}
                        />

                        <ActionButton
                            icon={FileText}
                            label="اسناد"
                            tab="documents"
                            onSelectTab={onSelectTab}
                        />

                        <ActionButton
                            icon={Bot}
                            label="دستیار"
                            tab="assistant"
                            onSelectTab={onSelectTab}
                        />
                    </div>
                </section>
            </div>

            <RecentActivities activities={caseItem.activities} />
        </>
    );
}
