import PaymentsHeader from './(payments)/PaymentsHeader';
import PaymentsStats from './(payments)/PaymentsStats';
import PaymentsTable from './(payments)/PaymentsTable';
import PaymentsNotice from './(payments)/PaymentsNotice';


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
