'use client';

import { useMemo, useState } from 'react';


import { lawyers } from './(lawyers)/lawyersData';
import LawyersHeader from '@/components/pages/dashboard/admin/(lawyers)/LawyersHeader';
import LawyersFilters from '@/components/pages/dashboard/admin/(lawyers)/LawyersFilters';
import LawyersTable from '@/components/pages/dashboard/admin/(lawyers)/LawyersTable';

export default function LawyersPage() {
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredLawyers = useMemo(() => {
        if (activeFilter === 'all') {
            return lawyers;
        }

        return lawyers.filter(
            (lawyer) => lawyer.verificationStatus === activeFilter,
        );
    }, [activeFilter]);

    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <LawyersHeader />

            <LawyersFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            <LawyersTable lawyers={filteredLawyers} />
        </div>
    );
}
