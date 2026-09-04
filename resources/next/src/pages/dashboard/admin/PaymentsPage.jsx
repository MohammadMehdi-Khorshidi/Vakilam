import PaymentsHeader from '../../../features/admin/payments/PaymentsHeader';
import PaymentsStats from '../../../features/admin/payments/PaymentsStats';
import PaymentsTable from '../../../features/admin/payments/PaymentsTable';
import PaymentsNotice from '../../../features/admin/payments/PaymentsNotice';


export default function PaymentsPage() {
    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1280px]">
            <PaymentsHeader/>

            <PaymentsStats />

            <PaymentsTable />

            <PaymentsNotice />
        </div>
    );
}
