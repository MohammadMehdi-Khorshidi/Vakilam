export default function ActionButton({ icon: Icon, label, tab, onSelectTab }) {
    return (
        <button
            type="button"
            onClick={() => onSelectTab(tab)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#dce6e2] bg-white px-4 py-4 text-sm font-bold text-[#183d36] transition hover:border-[#b9cec7] hover:bg-[#f5f8f6]"
        >
            <Icon size={18} />
            {label}
        </button>
    );
}
