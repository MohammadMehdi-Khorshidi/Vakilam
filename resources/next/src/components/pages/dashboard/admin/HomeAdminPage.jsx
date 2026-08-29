import LiveDateTime from './(home)/LiveDateTime';
import OperationalHero from './(home)/OperationalHero';
import StatsGrid from './(home)/StatsGrid';
import UrgentActions from './(home)/UrgentActions';
import SensitiveAccess from './(home)/SensitiveAccess';
import SecurityEventsTable from './(home)/SecurityEventsTable';

const HomeAdminPage = () => {
    return (
        <>
            <div className="mx-auto w-full px-5 mt-15 py-10 max-w-[1500px]">
                <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="text-3xl font-black leading-tight text-[#10352e] md:text-4xl">
                            مرکز کنترل وکیلم
                        </h1>

                        <p className="mt-3 text-sm leading-7 text-[#7d8983]">
                            وضعیت‌های نیازمند تصمیم، رویدادهای پرریسک و
                            فرایندهای مالی در یک نگاه.
                        </p>
                    </div>

                    <LiveDateTime/>
                </header>

                <OperationalHero />

                <StatsGrid />

                <section className="mt-5 grid gap-5 xl:grid-cols-2">
                    <UrgentActions />

                    <SensitiveAccess />
                </section>

                <SecurityEventsTable />
            </div>
        </>
    );

}
export default HomeAdminPage;
