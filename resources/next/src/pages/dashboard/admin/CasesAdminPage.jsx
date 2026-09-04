import CasesHeader from '../../../features/admin/cases/CasesHeader';
import CasesTable from '../../../features/admin/cases/CasesTable';
import CasesAccessNotice from '../../../features/admin/cases/CasesAccessNotice';


const cases = [
    {
        id: 'VK-1405-00128',
        title: 'مطالبه وجه چک',
        client: 'فرزام نجفی',
        status: 'در حال انتخاب وکیل',
        statusType: 'waiting',
        lawyer: '—',
    },
    {
        id: 'VK-1405-00121',
        title: 'تنظیم قرارداد تجاری',
        client: 'الهام رضایی',
        status: 'در انتظار تأیید قرارداد',
        statusType: 'contract',
        lawyer: 'سارا توکلی',
    },
    {
        id: 'VK-1405-00117',
        title: 'اختلاف پیمانکاری',
        client: 'موکل نمونه ۳',
        status: 'همکاری فعال',
        statusType: 'active',
        lawyer: 'امیررضا باقری',
    },
];

export default function AdminCasesPage() {
    return (
        <div className="mx-auto w-full max-w-[1280px]">
            <CasesHeader />

            <CasesTable cases={cases} />

            <CasesAccessNotice />
        </div>
    );
}
