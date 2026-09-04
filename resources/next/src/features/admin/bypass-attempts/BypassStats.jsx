function ChartIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 19V11M12 19V5M19 19V8M3 19H21"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function BypassStats({ stats }) {
    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <article
                    key={stat.id}
                    className="relative min-h-[116px] overflow-hidden rounded-[18px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_22px_rgba(20,61,52,0.05)]"
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#78847f]">
                                {stat.label}
                            </p>

                            <p className="mt-2 text-2xl font-black text-[#123b34]">
                                {stat.value}
                            </p>
                        </div>

                        <span className="flex size-12 items-center justify-center rounded-2xl border border-[#deE7e3] bg-[#f8fbfa] text-[#285f55]">
                            <ChartIcon />
                        </span>
                    </div>

                    <span
                        aria-hidden="true"
                        className="absolute -bottom-8 -left-8 size-16 rounded-full bg-[#fbf5e9]"
                    />
                </article>
            ))}
        </section>
    );
}
