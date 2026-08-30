import { lawyerFilters } from './lawyersData';

export default function LawyersFilters({ activeFilter, onFilterChange }) {
    return (
        <div className="mt-6 flex flex-wrap gap-3">
            {lawyerFilters.map((filter) => {
                const isActive = activeFilter === filter.id;

                return (
                    <button
                        key={filter.id}
                        type="button"
                        onClick={() => onFilterChange(filter.id)}
                        className={`min-h-11 rounded-full border px-5 text-sm font-bold transition ${
                            isActive
                                ? 'border-[#d1a64f] bg-[#fffaf0] text-[#173d35]'
                                : 'border-[#dce4df] bg-white text-[#6d7973] hover:border-[#c6a253]'
                        }`}
                    >
                        {filter.label}
                    </button>
                );
            })}
        </div>
    );
}
