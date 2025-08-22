import { Typography, Row, Col, message, Card } from 'antd';
import { useEffect, useState } from 'react'
import { useShelterStore } from '../store/useShelterStore'

const { Title, } = Typography

import { COLORS } from '../styles/colors'
import DonutChart from '../components/DonutChart'
import { NotificationList } from '../components/NotificationList'

import { getShelter } from '../services/shelterService'
import { getReliefStatistics, getReliefRequestsByShelter, getReliefSuppliesByShelter } from '../services/reliefService'
import { getUser } from '../services/userService'

import { LoadingSpinner } from '../components/common/LoadingSpinner';

const Main = () => {
    const selectedId = useShelterStore((s)=>s.selectedId)
    const [shelter, setShelter] = useState(null)
    const [statistics, setStatistics] = useState(null)
    const [recentRequests, setRecentRequests] = useState([])
    const [supplyLogs, setSupplyLogs] = useState([])
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // 시간 차이 계산 함수
    const getTimeAgo = (dateString) => {
        const now = new Date()
        const past = new Date(dateString)
        const diffMs = now - past
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)
        const remainingHours = diffHours % 24

        if (diffHours < 24) {
            return `${diffHours}시간 전`
        } else if (remainingHours === 0) {
            return `${diffDays}일 전`
        } else {
            return `${diffDays}일 ${remainingHours}시간 전`
        }
    }

    // 대피소 정보 및 통계 로드
    useEffect(() => {
        const loadData = async () => {
            if (!selectedId) {
                message.error('대피소가 선택되지 않았습니다.')
                return
            }

            try {
                // 대피소 정보, 통계, 최근 요청, 구호품 공급 로그 병렬 조회
                const [shelterResult, statisticsResult, requestsResult, suppliesResult] = await Promise.all([
                    getShelter(selectedId),
                    getReliefStatistics(selectedId, 7), // 최근 7일
                    getReliefRequestsByShelter(selectedId),
                    getReliefSuppliesByShelter(selectedId)
                ])

                if (shelterResult.success) {
                    setShelter(shelterResult.shelter)
                } else {
                    message.error('대피소 정보를 불러올 수 없습니다.')
                }

                if (statisticsResult.success) {
                    setStatistics(statisticsResult.statistics)
                } else {
                    console.error('통계 조회 실패:', statisticsResult.error)
                    // 통계 조회 실패 시 기본값 설정
                    setStatistics({
                        relief_items: [],
                        total_requests: 0,
                        total_supplies: 0,
                        pending_requests: 0
                    })
                }

                if (requestsResult.success) {
                    // 최근 요청 5개만 표시
                    setRecentRequests(requestsResult.requests.slice(0, 5))
                } else {
                    console.error('요청 조회 실패:', requestsResult.error)
                    // 요청 조회 실패 시 빈 배열 설정
                    setRecentRequests([])
                }

                if (suppliesResult.success) {
                    // 구호품 공급 로그에 사용자 정보 추가
                    const suppliesWithUserInfo = await Promise.all(
                        (suppliesResult.supplies || []).slice(0, 10).map(async (supply) => {
                            if (supply.supplier_id) {
                                try {
                                    const userResult = await getUser(supply.supplier_id)
                                    return {
                                        ...supply,
                                        supplier_user_info: userResult.success ? userResult.user : null
                                    }
                                } catch (error) {
                                    console.warn('사용자 정보 조회 실패:', error)
                                    return supply
                                }
                            }
                            return supply
                        })
                    )
                    setSupplyLogs(suppliesWithUserInfo)
                } else {
                    console.error('구호품 공급 로그 조회 실패:', suppliesResult.error)
                    // 구호품 공급 로그 조회 실패 시 빈 배열 설정
                    setSupplyLogs([])
                }

                // 알림마당 데이터 통합 및 정렬
                const allNotifications = []
                
                // 구호품 요청 알림 추가
                if (requestsResult.success) {
                    (requestsResult.requests || []).forEach(request => {
                        // 요청자 정보 조회 (필요시 추가 구현)
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
                if (suppliesResult.success) {
                    const suppliesWithUserInfo = await Promise.all(
                        (suppliesResult.supplies || []).map(async (supply) => {
                            let supplierName = supply.supplier_name || '익명'
                            
                            if (supply.supplier_id) {
                                try {
                                    const userResult = await getUser(supply.supplier_id)
                                    if (userResult.success) {
                                        supplierName = userResult.user.display_name || userResult.user.email || '익명'
                                    }
                                } catch (error) {
                                    console.warn('사용자 정보 조회 실패:', error)
                                }
                            }
                            
                            const suffix = supply.item_name && supply.item_name[supply.item_name.length - 1] && ['ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'].includes(supply.item_name[supply.item_name.length - 1]) ? '를' : '을';
                            return {
                                id: `supply_${supply.id || supply.supply_id}`,
                                type: 'supply',
                                message: `${supplierName}님이 필요 구호품 중 ${supply.item_name || '구호품'}${suffix} ${supply.supplied_quantity || 0}${supply.unit || '개'} 배송하였습니다.`,
                                timestamp: supply.created_at,
                                data: supply
                            }
                        })
                    )
                    allNotifications.push(...suppliesWithUserInfo)
                }

                // 시간순 정렬 (최신순)
                allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                
                // 최대 15개만 표시
                setNotifications(allNotifications.slice(0, 15))
            } catch (error) {
                message.error('데이터를 불러오는 중 오류가 발생했습니다.')
                console.error('데이터 로드 오류:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [selectedId])

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <LoadingSpinner text="통계 정보를 불러오는 중..." />
        )
    }

    if (!shelter) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Title level={3}>대피소 정보를 찾을 수 없습니다.</Title>
            </div>
        )
    }

    // 구호품 공급률 계산
    const reliefSupplyRate = statistics?.total_requests > 0 
        ? Math.round(((statistics?.total_supplies || 0) / statistics.total_requests) * 100)
        : 0

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