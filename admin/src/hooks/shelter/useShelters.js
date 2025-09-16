// hooks/shelter/useShelters.js
import { useAsync } from '../../hooks/useAsync';
import { getAllShelters } from '../../services/shelterService';

export const useShelters = (options = {}) => {
    const { data, loading, error, refetch } = useAsync(
        getAllShelters,
        [],
        {
            errorMessage: '대피소 정보를 불러올 수 없습니다.',
            ...options
        }
    )

    return {
        shelters: data?.shelters || [],
        isLoading: loading,
        error,
        refetch
    }
}