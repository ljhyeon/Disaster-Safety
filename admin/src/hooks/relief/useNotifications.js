// hooks/relief/useNotifications.js
import { useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { getReliefRequestsByShelter, getReliefSuppliesByShelter } from '../../services/reliefService';
import { v4 as uuidv4 } from 'uuid';

export const useNotifications = ( shelterId ) => {
    const { data: requestsData } = useAsync(
        () => shelterId ? getReliefRequestsByShelter(shelterId) : Promise.resolve({ success: false }),
        [shelterId],
        {
            immediate: !!shelterId,
            onError: (error) => console.error('요청 조회 실패:', error)
        }
    )

    const { data: suppliesData } = useAsync(
        () => shelterId ? getReliefSuppliesByShelter(shelterId) : Promise.resolve({ success: false }),
        [shelterId],
        {
            immediate: !!shelterId,
            onError: (error) => console.error('구호품 공급 로그 조회 실패:', error)
        }
    )

    const notifications = useMemo(() => {
        const allNotifications = []

        // 구호품 요청 알림 추가
        if (requestsData?.success && requestsData.requests) {
        requestsData.requests.forEach(request => {
            const requesterName = request.requester_name || '관리자'
            const itemsText = request.relief_items?.map(item => 
                `${item.item || item.item_name} ${item.quantity}${item.unit || '개'}`
            ).join(', ') || '구호품'

            allNotifications.push({
                id: `request_${request.request_id || uuidv4()}`,
                type: 'request',
                message: `${requesterName}님이 필요 구호품으로 ${itemsText} 등록하셨습니다.`,
                timestamp: request.created_at,
                data: request
            })
        })
        }

        // 구호품 공급 알림 추가
        if (suppliesData?.success && suppliesData.supplies) {
        suppliesData.supplies.forEach(supply => {
            let supplierName = supply.supplier_name || '익명'
            
            if (supply.supplier_user_info) {
                supplierName = supply.supplier_user_info.display_name || 
                        supply.supplier_user_info.email || '익명'
            }

            const suffix = supply.item_name && 
                        ['ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
                        .includes(supply.item_name[supply.item_name.length - 1])
                        ? '를' : '을'

            allNotifications.push({
                id: `supply_${supply.id || supply.supply_id || uuidv4()}`,
                type: 'supply',
                message: `${supplierName}님이 필요 구호품 중 ${supply.item_name || '구호품'}${suffix} ${supply.supplied_quantity || 0}${supply.unit || '개'} 배송하였습니다.`,
                timestamp: supply.created_at,
                data: supply
            })
        })
        }

        return allNotifications
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 15)
    }, [requestsData, suppliesData])

    return {
        notifications,
        isLoading: false // 알림은 필수가 아니므로 로딩 표시 안함
    }
}