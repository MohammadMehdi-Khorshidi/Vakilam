export default function PaymentStatusBadge({ status }) {
    const styles = {
        'آماده تسویه': 'border-[#cce9dc] bg-[#eefaf5] text-[#26745e]',

        متوقف: 'border-[#eedcae] bg-[#fff9e9] text-[#a27824]',

        غیرفعال‌سازی: 'border-[#f2caca] bg-[#fff2f2] text-[#c45c5c]',
    };

    return (
        <span
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                styles[status] || 'border-[#dce4df] bg-[#f7faf8] text-[#60716a]'
            }`}
        >
            {status}
        </span>
    );
}
