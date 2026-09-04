export default function StatCard({ title, value, icon: Icon }) {
    return (
        <article className="relative flex min-h-28 items-center gap-4 overflow-hidden rounded-2xl border border-[#dce6e2] bg-white px-5 py-6 shadow-sm">
            <div className="grid size-12 place-items-center rounded-xl border border-[#dce6e2] bg-[#f4f9f7] text-[#0b4d41]">
                <Icon size={23} />
            </div>

            <div>
                <p className="text-sm text-[#74827e]">{title}</p>

                <strong className="mt-1 block text-xl text-[#0b302b]">
                    {value}
                </strong>
            </div>

            <span className="absolute -bottom-7 -left-7 size-16 rounded-full bg-[#fbf5e8]" />
        </article>
    );

}
