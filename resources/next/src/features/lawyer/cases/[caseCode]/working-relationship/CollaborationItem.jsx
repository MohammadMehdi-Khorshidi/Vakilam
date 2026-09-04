export default function CollaborationItem({ label, children }) {
    return (
        <div className="rounded-xl border border-[#e3eae7] bg-[#fafcfb] px-5 py-4">
            <span className="block text-xs text-[#8b9894]">{label}</span>

            <strong className="mt-2 block text-sm leading-7 text-[#183d36]">
                {children || 'ثبت نشده'}
            </strong>
        </div>
    );
}
