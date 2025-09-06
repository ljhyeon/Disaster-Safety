// hooks/shelter/useShelter.js
import { useAsync } from '../../hooks/useAsync';
import { getShelter } from '../../services/shelterService';

export const useShelter = (shelterId, options = {}) => {
    const { data, loading, error, refetch } = useAsync(
        () => shelterId ? getShelter(shelterId) : Promise.resolve(null),
        [shelterId],
        {
            errorMessage: '대피소 정보를 불러올 수 없습니다.',
            ...options
        }
    )

    return {
        shelter: data?.shelter || null,
        isLoading: loading,
        error,
        refetch
    }
}