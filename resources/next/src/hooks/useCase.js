'use client';

import { useEffect, useState } from 'react';
import { getCase } from '@/services/caseService';

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

                const result = await getCase(caseId);
                setData(result);
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
