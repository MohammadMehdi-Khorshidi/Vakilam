export default function PanelTitle({ title, description }) {
    return (
        <div className="border-b border-[#e3e9e5] pb-4">
            <h2 className="text-lg font-black text-[#102f29]">{title}</h2>

            {description ? (
                <p className="mt-1 text-xs text-[#84908a]">{description}</p>
            ) : null}
        </div>
    );
}
