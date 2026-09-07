import { notFound } from 'next/navigation';

import PaymentDetailsPage from '../../../../../features/admin/payments/details/PaymentDetailsPage';
import { getPaymentById } from '../../../../../features/admin/payments/details/paymentDetailsData';

export default async function PaymentDetailsRoute({ params }) {
    const { paymentId } = await params;
    const payment = getPaymentById(paymentId);

    if (!payment) {
        notFound();
    }

    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f4f7f4] px-4 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10"
        >
            <PaymentDetailsPage payment={payment} />
        </main>
    );
}
