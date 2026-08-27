export default function InfoItem({ icon: Icon, children }) {
    return (
        <div className="flex items-center gap-2 rounded-xl bg-[#fafcfb] px-4 py-3 text-xs text-[#465a55]">
            <Icon size={16} />

            <span>{children}</span>
        </div>
    );
}
