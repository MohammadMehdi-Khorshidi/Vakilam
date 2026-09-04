export default function VerificationHeader({ verification }) {
    return (
        <header className="mb-7">
            <h1 className="text-2xl font-black text-[#123f37] sm:text-3xl">
                {verification.name}
            </h1>

            <p className="mt-2 text-sm text-[#7d8984]">
                {verification.issuer}
                <span className="mx-2">•</span>
                شماره پروانه {verification.licenseNumber}
            </p>
        </header>
    );
}
