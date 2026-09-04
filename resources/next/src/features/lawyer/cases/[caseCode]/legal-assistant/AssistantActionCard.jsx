import { ArrowLeft } from 'lucide-react';

export default function AssistantActionCard({ action, isActive, onClick }) {
    const Icon = action.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-right transition ${
                isActive
                    ? 'border-[#0b5648] bg-[#edf6f2]'
                    : 'border-[#e3eae7] bg-white hover:border-[#b9cec7] hover:bg-[#f7faf9]'
            }`}
        >
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f4f8f6] text-[#0b5648]">
                <Icon size={21} />
            </div>

            <div className="min-w-0 flex-1">
                <strong className="block text-sm text-[#183d36]">
                    {action.title}
                </strong>

                <span className="mt-1 block text-xs text-[#879590]">
                    {action.description}
                </span>
            </div>

            <ArrowLeft size={18} className="shrink-0" />
        </button>
    );
}
