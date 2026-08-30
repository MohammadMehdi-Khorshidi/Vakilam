export default function SecurityRuleCard({ rule }) {
    const Icon = rule.icon;

    return (
        <article className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#edf1ef] pb-4">
                <div className="grid size-10 place-items-center rounded-xl bg-[#edf6f2] text-[#0b5648]">
                    <Icon size={20} />
                </div>

                <h2 className="text-lg font-bold text-[#123b34]">
                    {rule.title}
                </h2>
            </div>

            <p className="mt-5 text-sm leading-8 text-[#52635e]">
                {rule.description}
            </p>
        </article>
    );
}
