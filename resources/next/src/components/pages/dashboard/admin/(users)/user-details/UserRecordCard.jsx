import LiveLastActivity from './LiveLastActivity';

function formatJoinedDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return 'نامشخص';
    }

    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

function InformationItem({
    title,
    children,
    borderBottom = true,
    borderLeft = false,
}) {
    return (
        <div
            className={`min-h-[82px] p-5 ${
                borderBottom ? 'border-b border-[#dfe6e2]' : ''
            } ${borderLeft ? 'md:border-l md:border-[#dfe6e2]' : ''}`}
        >
            <span className="block text-xs text-[#87938d]">{title}</span>

            <div className="mt-2 text-sm font-black text-[#173d35]">
                {children}
            </div>
        </div>
    );
}

export default function UserRecordCard({ user }) {
    return (
        <article className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            <header className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    اطلاعات کامل رکورد
                </h2>

                <p className="mt-2 text-xs text-[#85918b]">
                    اطلاعات عملیاتی قابل مشاهده در سطح فعلی
                </p>
            </header>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[#dce4df]">
                <div className="grid md:grid-cols-2">
                    <InformationItem title="شناسه کاربر" borderLeft>
                        <span dir="ltr">{user.id}</span>
                    </InformationItem>

                    <InformationItem title="نقش">{user.role}</InformationItem>

                    <InformationItem title="شماره همراه پوشیده" borderLeft>
                        <span dir="ltr">{user.maskedPhone}</span>
                    </InformationItem>

                    <InformationItem title="تاریخ عضویت">
                        {formatJoinedDate(user.joinedAt)}
                    </InformationItem>

                    <InformationItem title="تعداد پرونده" borderLeft>
                        {user.casesCount.toLocaleString('fa-IR')}
                    </InformationItem>

                    <InformationItem title="سطح ریسک">
                        {user.risk.label}
                    </InformationItem>

                    <InformationItem
                        title="آخرین فعالیت"
                        borderBottom={false}
                        borderLeft
                    >
                        <LiveLastActivity dateString={user.lastActivityAt} />
                    </InformationItem>

                    <InformationItem title="وضعیت" borderBottom={false}>
                        {user.status === 'active' ? 'فعال' : 'در انتظار احراز'}
                    </InformationItem>
                </div>
            </div>
        </article>
    );
}
