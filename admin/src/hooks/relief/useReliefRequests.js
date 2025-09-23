// hooks/relief/useReliefRequests.js
import { useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { getReliefRequestsDirectly } from '../../services/reliefService';

export const useReliefRequests = (shelterId, options = {}) => {
    const { data, loading, error, refetch } = useAsync(
        () => shelterId ? getReliefRequestsDirectly(shelterId) : Promise.resolve(null),
        [shelterId],
        {
            errorMessage: '구호품 요청 목록을 불러올 수 없습니다.',
            ...options
        }
    )

    const transformedRequests = useMemo(() => {
        if (!data?.success || !data?.requests) return []

        return data.requests.map((request) => ({
            id: request.doc_id || request.request_id,
            name: request.relief_items?.map(item => item.item).join(', ') || request.item_name || '구호품',
            description: `${request.relief_items?.length || 1}개 항목 • 총 ${request.total_requested}개 요청`,
            requestDate: new Date(request.created_at).toLocaleDateString(),
            currentStock: request.total_supplied,
            targetStock: request.total_requested,
            progress: request.supply_rate,
            status: request.supply_status,
            priority: request.priority,
            supplyDetails: request.relief_items_with_supply
        }))
    }, [data])

    return {
        requests: transformedRequests,
        isLoading: loading,
        error,
        refetch
    }
}