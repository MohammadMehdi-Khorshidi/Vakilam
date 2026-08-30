import { Check } from 'lucide-react';

const styles = {
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',

    current: 'border-[#d8b45d] bg-[#fffaf0] text-[#183d36]',

    pending: 'border-[#dce6e2] bg-white text-[#657571]',
};

export default function ContractStep({ number, title, description, status }) {
    const isCompleted = status === 'completed';

    return (
        <article
            className={`min-h-40 rounded-2xl border p-5 text-center ${styles[status]}`}
        >
            <div
                className={`mx-auto grid size-9 place-items-center rounded-full text-sm font-bold ${
                    isCompleted
                        ? 'bg-emerald-700 text-white'
                        : status === 'current'
                          ? 'bg-[#d8b45d] text-[#183d36]'
                          : 'border border-[#dce6e2] bg-white'
                }`}
            >
                {isCompleted ? <Check size={19} /> : number}
            </div>

            <h3 className="mt-4 text-base font-bold">{title}</h3>

            <p className="mt-2 text-sm leading-7 opacity-75">{description}</p>
        </article>
    );
}
