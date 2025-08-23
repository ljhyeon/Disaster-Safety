import { useMemo } from 'react';

import { Typography, Row, Col, Card } from 'antd';
import { useShelterStore } from '../store/useShelterStore'

const { Title, } = Typography;

import { COLORS } from '../styles/colors';
import DonutChart from '../components/DonutChart';

import { getShelter } from '../services/shelterService';
import { getReliefStatistics, getReliefRequestsByShelter, getReliefSuppliesByShelter } from '../services/reliefService';

import { LoadingSpinner } from '../components/common/LoadingSpinner';
import NotificationList from '../components/notification/NotificationList';
import ShelterInfoCard from '../components/shelter/ShelterInfoCard';
import ReliefInfoCard from '../components/shelter/ReliefInfoCard';

import { useAsync } from '../hooks/useAsync';

import { v4 as uuidv4 } from 'uuid';

const Main = () => {
    const selectedId = useShelterStore((s)=>s.selectedId);

    const { data: shelterData, loading: shelterLoading } = useAsync(
        () => selectedId ? getShelter(selectedId) : Promise.resolve({ success: false }),
        [selectedId],
        {
            errorMessage: '대피소 정보를 불러올 수 없습니다.',
            onError: (error) => console.error('대피소 조회 실패:', error)
        }
    );

    const { data: statisticsData, loading: statisticsLoading } = useAsync(
        () => selectedId ? getReliefStatistics(selectedId, 7) : Promise.resolve({ success: false }),
        [selectedId],
        {
            immediate: !!selectedId,
            onError: (error) => {
                console.error('통계 조회 실패:', error)
                // 통계 실패 시에는 에러 메시지 표시하지 않음 (기본값 사용)
            }
        }
    );

    const { data: requestsData } = useAsync(
        () => selectedId ? getReliefRequestsByShelter(selectedId) : Promise.resolve({ success: false }),
        [selectedId],
        {
            immediate: !!selectedId,
            onError: (error) => console.error('요청 조회 실패:', error)
        }
    );

    const { data: suppliesData } = useAsync(
        () => selectedId ? getReliefSuppliesByShelter(selectedId) : Promise.resolve({ success: false }),
        [selectedId],
        {
            immediate: !!selectedId,
            onError: (error) => console.error('구호품 공급 로그 조회 실패:', error)
        }
    );

    // 데이터 추출 및 기본값 설정
    const shelter = shelterData?.shelter || null
    const statistics = statisticsData?.statistics || {
        relief_items: [],
        total_requests: 0,
        total_supplies: 0,
        pending_requests: 0
    }
    // const recentRequests = requestsData?.requests?.slice(0, 5) || []
    // const supplyLogs = suppliesData?.supplies?.slice(0, 10) || []

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
                    id: `request_${request.request_id || crypto.randomUUID() || uuidv4()}`, // fallback ID
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
                
                // 사용자 정보가 있으면 사용 (추후 별도 훅으로 분리 가능)
                if (supply.supplier_user_info) {
                    supplierName = supply.supplier_user_info.display_name || 
                                 supply.supplier_user_info.email || '익명'
                }

                const suffix = supply.item_name && 
                                ['ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
                                .includes(supply.item_name[supply.item_name.length - 1])
                                ? '를' : '을'

                allNotifications.push({
                    id: `supply_${supply.id || supply.supply_id || crypto.randomUUID() || uuidv4()}`, // fallback ID
                    type: 'supply',
                    message: `${supplierName}님이 필요 구호품 중 ${supply.item_name || '구호품'}${suffix} ${supply.supplied_quantity || 0}${supply.unit || '개'} 배송하였습니다.`,
                    timestamp: supply.created_at,
                    data: supply
                })
            })
        }

        // 시간순 정렬 (최신순) 및 최대 15개
        return allNotifications
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 15)
    }, [requestsData, suppliesData]);

    // 구호품 공급률 계산
    const reliefSupplyRate = useMemo(() => {
        return statistics?.total_requests > 0 
            ? Math.round(((statistics?.total_supplies || 0) / statistics.total_requests) * 100)
            : 0
    }, [statistics]);

    // 로딩 상태 확인 (필수 데이터만)
    const isLoading = shelterLoading || statisticsLoading;

    // 선택된 대피소가 없을 때
    if (!selectedId) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Title level={3}>대피소를 선택해주세요.</Title>
            </div>
        )
    }

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <LoadingSpinner text="통계 정보를 불러오는 중..." />
        )
    }

    // 대피소 정보를 찾을 수 없을 때
    if (!shelter) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Title level={3}>대피소 정보를 찾을 수 없습니다.</Title>
            </div>
        )
    }

    return (
        <>
            <Title level={1}>
                {shelter.shelter_name} - 대피소 내 통계
            </Title>
            
            {/* 기본 통계 */}
            <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={12} md={8}>
                    <DonutChart 
                        title="수용 인원률" 
                        value={shelter.occupancy_rate} 
                        color={COLORS.primaryLight} 
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <DonutChart 
                        title="구호품 공급률" 
                        value={reliefSupplyRate} 
                        color={COLORS.primaryHover} 
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <DonutChart 
                        title="대기 요청률" 
                        value={statistics?.total_requests > 0 
                            ? Math.round(((statistics?.pending_requests || 0) / statistics.total_requests) * 100)
                            : 0} 
                        color={COLORS.primary} 
                    />
                </Col>
            </Row>

            {/* 상세 정보 카드 */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} md={12}>
                    <ShelterInfoCard shelter={shelter} />
                </Col>
                <Col xs={24} md={12}>
                    <ReliefInfoCard statistics={statistics} reliefSupplyRate={reliefSupplyRate} />
                </Col>
            </Row>

            <NotificationList title="알림마당" notifications={notifications} />
        </>
    )
}

export default Main;