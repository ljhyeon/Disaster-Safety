import { useMemo } from 'react';

import { Typography, Row, Col, Card } from 'antd';
import { useShelterStore } from '../store/useShelterStore'

const { Title, } = Typography;

import { COLORS } from '../styles/colors';
import DonutChart from '../components/DonutChart';

import { getShelter } from '../services/shelterService';
import { getReliefStatistics, getReliefRequestsByShelter, getReliefSuppliesByShelter } from '../services/reliefService';

import { LoadingSpinner } from '../components/common/LoadingSpinner';

import { useAsync } from '../hooks/useAsync';
import { getTimeAgo } from '../utils/getTimeAge';

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
                    id: `request_${request.request_id}`,
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
                             supply.item_name[supply.item_name.length - 1] && 
                             ['ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
                               .includes(supply.item_name[supply.item_name.length - 1]) ? '를' : '을'
                
                allNotifications.push({
                    id: `supply_${supply.id || supply.supply_id}`,
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
                    <Card title="대피소 현황" size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>수용 인원:</span>
                            <span><strong>{shelter.current_occupancy}</strong> / {shelter.capacity}명</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>수용률:</span>
                            <span><strong>{shelter.occupancy_rate}%</strong></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>운영 상태:</span>
                            <span style={{ 
                                color: shelter.status === '운영중' ? '#52c41a' : 
                                      shelter.status === '포화' ? '#ff4d4f' : '#faad14'
                            }}>
                                <strong>{shelter.status}</strong>
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>재난 유형:</span>
                            <span><strong>{shelter.disaster_type}</strong></span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="구호품 현황 (최근 7일)" size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>총 요청 건수:</span>
                            <span><strong>{statistics?.total_requests || 0}</strong>건</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>총 공급 건수:</span>
                            <span><strong>{statistics?.total_supplies || 0}</strong>건</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>대기 중 요청:</span>
                            <span style={{ color: statistics?.pending_requests > 0 ? '#ff4d4f' : '#52c41a' }}>
                                <strong>{statistics?.pending_requests || 0}</strong>건
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>공급률:</span>
                            <span><strong>{reliefSupplyRate}%</strong></span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 알림마당 */}
            <Card title="알림마당" style={{ marginTop: '24px' }}>
                {notifications.length > 0 ? (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.map((notification, index) => (
                            <div key={notification.id} style={{ 
                                padding: '16px', 
                                borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                                display: 'flex',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%',
                                    backgroundColor: notification.type === 'request' ? '#1890ff' : '#52c41a',
                                    marginTop: '6px',
                                    marginRight: '12px',
                                    flexShrink: 0
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '14px', 
                                        lineHeight: '1.5',
                                        marginBottom: '4px',
                                        color: '#333'
                                    }}>
                                        {notification.message}
                                    </div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        color: '#999'
                                    }}>
                                        {getTimeAgo(notification.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px',
                        color: '#999'
                    }}>
                        알림이 없습니다.
                    </div>
                )}
            </Card>
        </>
    )
}

export default Main;