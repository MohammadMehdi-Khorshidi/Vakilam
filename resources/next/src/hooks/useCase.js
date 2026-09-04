'use client';

import { useEffect, useState } from 'react';

import { getClientCase } from '@/lib/api/user';

const useCase = (caseId) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(caseId));
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!caseId) {
            return;
        }

        const fetchCase = async () => {
            try {
                setIsLoading(true);
                setIsError(false);

                setData(await getClientCase(caseId));
            } catch (error) {
                console.error('useCase error:', error);

                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCase();
    }, [caseId]);

    return {
        data,
        isLoading,
        isError,
    };
};

export default useCase;
