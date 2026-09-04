export default function StatCard({ icon: Icon, title, value, description }) {
    return (
        <article className="rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-[#7a8985]">{title}</p>

                    <strong className="mt-2 block text-2xl text-[#123b34]">
                        {value}
                    </strong>

                    {description && (
                        <p className="mt-2 text-xs text-[#94a09d]">
                            {description}
                        </p>
                    )}
                </div>

                <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#e1e9e6] bg-[#f7faf9] text-[#0b302b]">
                    <Icon size={21} />
                </div>
            </div>
        </article>
    );
}
