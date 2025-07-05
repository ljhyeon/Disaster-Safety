import { Typography, Row, Col, Spin, message, Card } from 'antd'
import { useEffect, useState } from 'react'
import { useShelterStore } from '../store/useShelterStore'

const { Title, } = Typography

import { COLORS } from '../styles/colors'
import DonutChart from '../components/DonutChart'
import { NotificationList } from '../components/NotificationList'

import { getShelter } from '../services/shelterService'
import { getReliefStatistics, getReliefRequestsByShelter } from '../services/reliefService'

const Main = () => {
    const selectedId = useShelterStore((s)=>s.selectedId)
    const [shelter, setShelter] = useState(null)
    const [statistics, setStatistics] = useState(null)
    const [recentRequests, setRecentRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // 대피소 정보 및 통계 로드
    useEffect(() => {
        const loadData = async () => {
            if (!selectedId) {
                message.error('대피소가 선택되지 않았습니다.')
                return
            }

            try {
                // 대피소 정보, 통계, 최근 요청 병렬 조회
                const [shelterResult, statisticsResult, requestsResult] = await Promise.all([
                    getShelter(selectedId),
                    getReliefStatistics(selectedId, 7), // 최근 7일
                    getReliefRequestsByShelter(selectedId)
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
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <div>통계 정보를 불러오는 중...</div>
            </div>
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

            {/* 최근 구호품 요청 목록 */}
            <Card title="최근 구호품 요청" style={{ marginTop: '24px' }}>
                {recentRequests.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {recentRequests.map((request, index) => (
                            <div key={request.request_id} style={{ 
                                padding: '12px', 
                                borderBottom: index < recentRequests.length - 1 ? '1px solid #f0f0f0' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                        {request.relief_items?.map(item => item.item).join(', ') || '구호품 정보 없음'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {new Date(request.created_at).toLocaleDateString()} • 
                                        {request.total_items}개 항목 • 
                                        우선순위: {request.priority}
                                    </div>
                                </div>
                                <div style={{ 
                                    padding: '2px 8px', 
                                    borderRadius: '4px',
                                    backgroundColor: request.status === 'pending' ? '#fff2e8' : 
                                                   request.status === 'completed' ? '#f6ffed' : '#f0f0f0',
                                    color: request.status === 'pending' ? '#d46b08' : 
                                           request.status === 'completed' ? '#389e0d' : '#666',
                                    fontSize: '12px'
                                }}>
                                    {request.status === 'pending' ? '대기중' : 
                                     request.status === 'completed' ? '완료' : 
                                     request.status === 'in_progress' ? '진행중' : '취소'}
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
                        최근 구호품 요청이 없습니다.
                    </div>
                )}
            </Card>
        </>
    )
}

export default Main;