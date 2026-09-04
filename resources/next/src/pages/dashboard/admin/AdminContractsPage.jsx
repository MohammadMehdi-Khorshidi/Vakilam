import ContractsHeader from '../../../features/admin/contracts/ContractsHeader';
import ContractsTable from '../../../features/admin/contracts/ContractsTable';


export default function ContractsPage() {
    return (
        <div dir="rtl" className="w-full">
            <ContractsHeader />

            <ContractsTable />

            {/* توضیح پایین صفحه */}
            <div className="mt-4 rounded-2xl border border-[#d8e9ee] bg-[#f1f9fc] px-5 py-4">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[#39758a]">
                        i
                    </span>

                    <p className="text-xs leading-7 text-[#70827c]">
                        وضعیت قراردادها بر اساس ثبت در سامانه، تأیید موکل و
                        وضعیت مالی به‌روزرسانی می‌شود.
                    </p>
                </div>
            </div>
        </div>
    );
}
