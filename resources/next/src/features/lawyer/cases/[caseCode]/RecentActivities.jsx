import ActivityItem from './ActivityItem';

export default function RecentActivities({ activities }) {
    if (!activities?.length) {
        return (
            <section className="mt-5 rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                <h2 className="border-b border-[#edf1ef] pb-4 text-lg font-bold text-[#123b34]">
                    آخرین فعالیت‌ها
                </h2>

                <p className="py-10 text-center text-sm text-[#8a9894]">
                    هنوز فعالیتی برای این پرونده ثبت نشده است.
                </p>
            </section>
        );
    }

    return (
        <section className="mt-5 rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <h2 className="border-b border-[#edf1ef] pb-4 text-lg font-bold text-[#123b34]">
                آخرین فعالیت‌ها
            </h2>

            <div className="mt-5">
                {activities.map((activity, index) => (
                    <ActivityItem
                        key={activity.id}
                        activity={activity}
                        isLast={index === activities.length - 1}
                    />
                ))}
            </div>
        </section>
    );
}
