
import { verificationRequests } from './(verifications)/verificationsData';
import VerificationsHeader from '@/components/pages/dashboard/admin/(verifications)/VerificationsHeader';
import VerificationList from '@/components/pages/dashboard/admin/(verifications)/VerificationList';

export default function VerificationsPage() {
    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1280px]">
            <VerificationsHeader />

            <VerificationList requests={verificationRequests} />
        </div>
    );
}
