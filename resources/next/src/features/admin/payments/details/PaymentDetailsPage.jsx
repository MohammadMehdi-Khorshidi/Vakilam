import PaymentAccessCard from './PaymentAccessCard';
import PaymentHeader from './PaymentHeader';
import PaymentInfoCard from './PaymentInfoCard';
import PaymentReleaseStatus from './PaymentReleaseStatus';

export default function PaymentDetailsPage({ payment }) {
    if (!payment) {
        return null;
    }

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1280px]">
            <PaymentHeader payment={payment} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                <PaymentAccessCard payment={payment} />
                <PaymentInfoCard payment={payment} />
            </div>

            <PaymentReleaseStatus payment={payment} />
        </div>
    );
}
