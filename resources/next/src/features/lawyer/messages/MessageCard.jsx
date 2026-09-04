const MessageCard = ({ message }) => {
    return (
        <div
            className={`flex min-h-[74px] items-center justify-between gap-5 rounded-2xl px-4 py-3 transition ${
                message.unread
                    ? 'border border-[#e3eee9] bg-[#f1f7f4]'
                    : 'bg-white'
            }`}
        >
            {/* اطلاعات پیام */}
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f4f0e5] text-sm font-bold text-[#0b302b]">
                    {message.avatar}
                </div>

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#173d37]">
                        {message.title}
                    </h3>

                    <p className="mt-1 text-[11px] text-[#8b9692]">
                        {message.caseCode} · {message.messageType} ·{' '}
                        {message.clientName}
                    </p>
                </div>
            </div>

            {/* وضعیت */}
            <div className="shrink-0">
                <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                        message.unread
                            ? 'border-[#f0d99a] bg-[#fffaf0] text-[#a77820]'
                            : 'border-[#cde5ee] bg-[#f1f9fc] text-[#43809a]'
                    }`}
                >
                    {message.status}
                </span>
            </div>
        </div>
    );
};

export default MessageCard;
