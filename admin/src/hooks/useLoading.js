import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
    const [isLoading, setIsLoading] = useState(initialState);

    const withLoading = useCallback(async (asyncFn) => {
        setIsLoading(true);
        try {
            const result = await asyncFn();
            return result;
        } finally {
            setIsLoading(false);
        }
    }, [])

    return { isLoading, setIsLoading, withLoading }
}