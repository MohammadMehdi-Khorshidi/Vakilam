import VerificationCard from './VerificationCard';

export default function VerificationList({ requests }) {
    return (
        <section className="rounded-2xl border border-[#dce4df] bg-white p-4 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-5">
            <div className="space-y-2">
                {requests.map((request) => (
                    <VerificationCard key={request.id} request={request} />
                ))}
            </div>
        </section>
    );
}
