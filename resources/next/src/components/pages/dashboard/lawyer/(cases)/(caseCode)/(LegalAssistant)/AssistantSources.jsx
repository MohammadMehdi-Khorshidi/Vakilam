import { Search, X } from 'lucide-react';

export default function AssistantSources({
    searchText,
    onSearchChange,
    sources,
    onClose,
}) {
    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between gap-4 border-b border-[#edf1ef] pb-5">
                <div>
                    <h2 className="text-xl font-bold text-[#123b34]">
                        جست‌وجوی قوانین و منابع
                    </h2>

                    <p className="mt-1 text-xs text-[#879590]">
                        جست‌وجوی نمایشی داخل منابع عمومی
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="بستن"
                    className="grid size-9 place-items-center rounded-lg border border-[#dce6e2] hover:bg-[#f5f8f6]"
                >
                    <X size={18} />
                </button>
            </header>

            <label className="relative mt-5 block">
                <Search
                    size={19}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#879590]"
                />

                <input
                    type="search"
                    value={searchText}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="جست‌وجوی چک، خسارت، دادخواست..."
                    className="w-full rounded-xl border border-[#dce6e2] py-3 pl-4 pr-12 text-sm outline-none transition focus:border-[#0b5648]"
                />
            </label>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {sources.map((source) => (
                    <article
                        key={source.id}
                        className="rounded-xl border border-[#e3eae7] bg-[#fafcfb] p-5"
                    >
                        <h3 className="font-bold text-[#183d36]">
                            {source.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#657571]">
                            {source.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {source.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-[#edf6f2] px-3 py-1 text-xs text-[#0b5648]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>

            {!sources.length && (
                <p className="py-10 text-center text-sm text-[#879590]">
                    منبعی مطابق عبارت جست‌وجو پیدا نشد.
                </p>
            )}
        </section>
    );
}
