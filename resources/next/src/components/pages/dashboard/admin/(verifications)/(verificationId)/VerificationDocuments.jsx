import VerificationDocumentItem from './VerificationDocumentItem';

export default function VerificationDocuments({ documents }) {
    return (
        <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            {/* Header */}

            <div className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">مدارک</h2>
            </div>

            {/* Documents */}

            <div className="mt-4 space-y-2">
                {documents.map((item, index) => (
                    <VerificationDocumentItem
                        key={item.id ?? index}
                        item={{
                            ...item,
                            number: index + 1,
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
