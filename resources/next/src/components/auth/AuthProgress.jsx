export default function AuthProgress({ currentStep, totalSteps = 4 }) {
    return (
        <div
            className="mt-6 grid grid-cols-4 gap-2.5"
            style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
            aria-label={`مرحله ${currentStep} از ${totalSteps}`}
        >
            {Array.from({ length: totalSteps }, (_, index) => index + 1).map((step) => (
                <span
                    key={step}
                    className={`h-1.5 rounded-full transition-colors ${
                        step <= currentStep ? 'bg-[#155447]' : 'bg-[#e3e8e6]'
                    }`}
                />
            ))}
        </div>
    );
}
