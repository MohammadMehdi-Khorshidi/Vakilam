import { Clipboard, Sparkles, X } from 'lucide-react';

export default function AssistantResult({
    result,
    isCopied,
    onCopy,
    onChange,
    onClose,
}) {
    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between gap-4 border-b border-[#edf1ef] pb-5">
                <div className="flex items-center gap-3">
                    <Sparkles size={21} className="text-[#0b5648]" />

                    <div>
                        <h2 className="text-xl font-bold text-[#123b34]">
                            {result.title}
                        </h2>

                        <p className="mt-1 text-xs text-[#879590]">
                            خروجی قابل ویرایش و نیازمند بازبینی وکیل
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="بستن"
                    className="grid size-9 place-items-center rounded-lg border border-[#dce6e2] transition hover:bg-[#f5f8f6]"
                >
                    <X size={18} />
                </button>
            </header>

            <textarea
                value={result.text}
                onChange={(event) => onChange(event.target.value)}
                rows={14}
                className="mt-5 w-full resize-y rounded-xl border border-[#dce6e2] bg-[#fafcfb] p-5 text-sm leading-8 text-[#183d36] outline-none transition focus:border-[#0b5648]"
            />

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={onCopy}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0b5648] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073f35]"
                >
                    <Clipboard size={17} />

                    {isCopied ? 'کپی شد' : 'کپی متن'}
                </button>
            </div>
        </section>
    );
}
