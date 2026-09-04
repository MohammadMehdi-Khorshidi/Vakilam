
import { verificationRequests } from '../../../features/admin/verifications/verificationsData';
import VerificationsHeader from '@/features/admin/verifications/VerificationsHeader';
import VerificationList from '@/features/admin/verifications/VerificationList';


export default function VerificationsPage() {
    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1280px]">
            <VerificationsHeader />

            <VerificationList requests={verificationRequests} />
        </div>
    );
}
