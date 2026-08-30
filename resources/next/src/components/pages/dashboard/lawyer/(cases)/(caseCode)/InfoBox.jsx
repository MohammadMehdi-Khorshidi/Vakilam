export default function InfoBox({ label, value }) {
    return (
        <div className="rounded-xl border border-[#e4ebe8] bg-[#fafcfb] p-4">
            <span className="block text-xs text-[#8a9894]">{label}</span>

            <strong className="mt-2 block text-sm text-[#183d36]">
                {value}
            </strong>
        </div>
    );
}
