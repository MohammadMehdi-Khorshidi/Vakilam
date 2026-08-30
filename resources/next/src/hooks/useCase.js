'use client';

import { useEffect, useState } from 'react';

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

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/client/cases/${caseId}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                        },
                        credentials: 'include',
                    },
                );

                if (!response.ok) {
                    throw new Error('خطا در دریافت اطلاعات پرونده');
                }

                const result = await response.json();

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
