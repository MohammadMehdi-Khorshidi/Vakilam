
import { bypassEvents, bypassStats } from '../../../features/admin/bypass-attempts/bypassData';
import BypassHeader from '../../../features/admin/bypass-attempts/BypassHeader';
import BypassStatus from '../../../features/admin/bypass-attempts/BypassStatus';
import BypassTable from '../../../features/admin/bypass-attempts/BypassTable';
import BypassNotice from '../../../features/admin/bypass-attempts/BypassNotice';


export default function BypassPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-10 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <BypassHeader />

                <BypassStatus stats={bypassStats} />

                <div className="mt-5">
                    <BypassTable events={bypassEvents} />
                </div>

                <div className="mt-4">
                    <BypassNotice />
                </div>
            </div>
        </main>
    );
}
