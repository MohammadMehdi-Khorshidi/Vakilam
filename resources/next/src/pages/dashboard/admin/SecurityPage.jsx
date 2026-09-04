import SecurityHeader from '../../../features/admin/security/SecurityHeader';
import SecurityTable from '../../../features/admin/security/SecurityTable';
import { securityEvents } from '../../../features/admin/security/securityData';

export default function SecurityPage() {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-10 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <SecurityHeader />

                <SecurityTable events={securityEvents} />
            </div>
        </main>
    );
}
