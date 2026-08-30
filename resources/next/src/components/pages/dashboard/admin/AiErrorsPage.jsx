
import { aiErrors } from './(ai-errors)/aiErrorsData';
import AiErrorsHeader from '@/components/pages/dashboard/admin/(ai-errors)/AiErrorsHeader';
import AiErrorsTable from '@/components/pages/dashboard/admin/(ai-errors)/AiErrorsTable';
import AiErrorsNotice from '@/components/pages/dashboard/admin/(ai-errors)/AiErrorsNotice';

export default function AiErrorsPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-10 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <AiErrorsHeader />

                <AiErrorsTable errors={aiErrors} />

                <div className="mt-4">
                    <AiErrorsNotice />
                </div>
            </div>
        </main>
    );
}
