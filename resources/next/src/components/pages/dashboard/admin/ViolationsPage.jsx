
import { violations } from './(violations)/violationsData';
import ViolationsHeader from '@/components/pages/dashboard/admin/(violations)/ViolationsHeader';
import ViolationsTable from '@/components/pages/dashboard/admin/(violations)/ViolationsTable';

export default function ViolationsPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-12 text-[#123b34] sm:px-7 lg:px-10 lg:py-16"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <ViolationsHeader />

                <ViolationsTable violations={violations} />
            </div>
        </main>
    );
}
