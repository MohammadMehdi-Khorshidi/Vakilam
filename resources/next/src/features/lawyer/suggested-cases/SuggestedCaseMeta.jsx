const SuggestedCaseMeta = ({ label, value }) => {
    return (
        <div className="flex items-center justify-end gap-2">
            <span className="text-[#8a9590]">{label}</span>

            <span className="font-medium text-[#173b34]">{value}</span>
        </div>
    );
};

export default SuggestedCaseMeta;
