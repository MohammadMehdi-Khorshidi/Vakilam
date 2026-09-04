import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const proposals = [
    {
        id: 1,
        title: 'مطالبه وجه چک',
        code: 'VK-1405-00128',
        amount: '۴۸,۰۰۰,۰۰۰ تومان',
        time: 'امروز، ۱۱:۳۰',
        status: 'انتخاب شده برای مذاکره',
        statusType: 'success',
        action: 'ورود به مذاکره',
    },
    {
        id: 2,
        title: 'اختلاف قرارداد پیمانکاری',
        code: 'VK-1405-00114',
        amount: '۶۰,۰۰۰,۰۰۰ تومان',
        time: 'دیروز',
        status: 'در انتظار تصمیم موکل',
        statusType: 'waiting',
        action: 'مشاهده',
    },
];

const statusStyles = {
    success: 'border-[#cfe8df] bg-[#f0faf6] text-[#28745f]',
    waiting: 'border-[#ead8a7] bg-[#fffaf0] text-[#a77713]',
};

const ProposalsTable = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[20px] border border-[#e1e8e4] bg-white p-5 shadow-[0_4px_20px_rgba(18,63,55,0.04)] sm:p-7`}
        >
            {/* Header */}
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-5 border-b border-[#edf0ee] px-4 pb-4 text-sm font-bold text-[#7c8581] lg:grid">
                <div>پرونده</div>
                <div>مبلغ</div>
                <div>زمان ارسال</div>
                <div>وضعیت</div>
                <div>اقدام</div>
            </div>

            {/* Rows */}
            <div>
                {proposals.map((proposal) => (
                    <div
                        key={proposal.id}
                        className="grid grid-cols-1 gap-5 border-b border-[#edf0ee] px-4 py-5 last:border-b-0 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:items-center"
                    >
                        {/* پرونده */}
                        <div>
                            <p className="font-bold text-[#173b34]">
                                {proposal.title}
                            </p>

                            <p className="mt-1 text-sm text-[#8b9590]">
                                {proposal.code}
                            </p>
                        </div>

                        {/* مبلغ */}
                        <div>
                            <span className="mb-1 block text-xs text-[#9aa39f] lg:hidden">
                                مبلغ
                            </span>

                            <p className="font-medium text-[#344b45]">
                                {proposal.amount}
                            </p>
                        </div>

                        {/* زمان */}
                        <div>
                            <span className="mb-1 block text-xs text-[#9aa39f] lg:hidden">
                                زمان ارسال
                            </span>

                            <p className="text-sm text-[#596762]">
                                {proposal.time}
                            </p>
                        </div>

                        {/* وضعیت */}
                        <div>
                            <span className="mb-1 block text-xs text-[#9aa39f] lg:hidden">
                                وضعیت
                            </span>

                            <span
                                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyles[proposal.statusType]}`}
                            >
                                {proposal.status}
                            </span>
                        </div>

                        {/* اقدام */}
                        <div>
                            <span className="mb-1 block text-xs text-[#9aa39f] lg:hidden">
                                اقدام
                            </span>

                            <button
                                type="button"
                                className="font-bold text-[#236458] transition hover:text-[#123f37]"
                            >
                                {proposal.action}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProposalsTable;
