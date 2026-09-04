import { dashboardStats } from './dashboardData';
import StatCard from './StatCard';

export default function StatsGrid() {
    return (
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((item) => (
                <StatCard key={item.id} item={item} />
            ))}
        </section>
    );
}
