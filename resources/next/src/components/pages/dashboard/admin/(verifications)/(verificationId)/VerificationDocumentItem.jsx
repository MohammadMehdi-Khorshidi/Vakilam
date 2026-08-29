export default function VerificationDocumentItem({
    title,
    description,
    number,
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-[#dce4df] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f3f7f4] text-sm font-black text-[#17463c]">
                    {number}
                </span>

                <div>
                    <h3 className="text-sm font-bold text-[#263f38]">
                        {title}
                    </h3>

                    <p className="mt-1 text-[11px] text-[#87938d]">
                        {description}
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="rounded-xl border border-[#cfe4dc] bg-[#f7fcf9] px-3 py-2 text-xs font-bold text-[#17463c] transition hover:bg-[#edf7f2]"
            >
                تطبیق و پیش‌نمایش
            </button>
        </div>
    );
}
