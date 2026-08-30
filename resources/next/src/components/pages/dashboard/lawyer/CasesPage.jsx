import CaseCard from './(cases)/CaseCard';
import StatCard from './(cases)/CasesStats';
import { cases, stats } from './(cases)/CasesList';

export const metadata = {
    title: 'پرونده‌های وکیل | وکیلم',
};

export default function LawyerCasesPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f5f8f6] px-4 py-8 text-[#0b302b] sm:px-6 lg:px-10"
        >
            <div className="mx-auto max-w-[1500px]">
                <header className="mb-7">
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        پرونده‌ها و همکاری‌های وکیل
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#7b8985]">
                        ابتدا پرونده را انتخاب کنید؛ سپس پیام‌ها، جلسات، کارها،
                        اسناد، قرارداد، پرداخت و دستیار همان پرونده را ببینید.
                    </p>
                </header>

                <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.id}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                        />
                    ))}
                </section>

                <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
                    {cases.map((item) => (
                        <CaseCard key={item.id} item={item} />
                    ))}
                </section>
            </div>
        </main>
    );
}
