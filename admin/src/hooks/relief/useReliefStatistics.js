// hooks/relief/useReliefStatistics.js
import { useAsync } from '../../hooks/useAsync';
import { getReliefStatistics } from '../../services/reliefService';

export const useReliefStatistics = (shelterId, days = 7, options = {}) => {
    const { data, loading, error, refetch } = useAsync(
        () => shelterId ? getReliefStatistics(shelterId, days) : Promise.resolve({ success: false }),
        [shelterId, days],
        {
            immediate: !!shelterId,
            onError: (error) => {
                console.error('통계 조회 실패:', error)
                // 통계는 실패해도 기본값으로 계속 진행
            },
            ...options
        }
    )

    const statistics = data?.statistics || {
        relief_items: [],
        total_requests: 0,
        total_supplies: 0,
        pending_requests: 0
    }

    const reliefSupplyRate = statistics.total_requests > 0 
        ? Math.round(((statistics.total_supplies || 0) / statistics.total_requests) * 100)
        : 0

    return {
        statistics,
        reliefSupplyRate,
        isLoading: loading,
        error,
        refetch
    }
}