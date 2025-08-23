import { Typography, Row, Col, } from 'antd';
import { useShelterStore } from '../store/useShelterStore'

const { Title, } = Typography;

import { COLORS } from '../styles/colors';
import DonutChart from '../components/DonutChart';

import { LoadingSpinner } from '../components/common/LoadingSpinner';
import NotificationList from '../components/notification/NotificationList';
import ShelterInfoCard from '../components/shelter/ShelterInfoCard';
import ReliefInfoCard from '../components/shelter/ReliefInfoCard';

import { useShelter } from '../hooks/shelter/useShelter';
import { useReliefStatistics } from '../hooks/relief/useReliefStatistics';
import { useNotifications } from '../hooks/relief/useNotifications';

const Main = () => {
    const selectedId = useShelterStore((s)=>s.selectedId);

    const { shelter, isLoading: shelterLoading } = useShelter(selectedId);
    const { statistics, reliefSupplyRate, isLoading: statsLoading } = useReliefStatistics(selectedId);
    const { notifications } = useNotifications(selectedId);
    
    // 로딩 상태 확인 (필수 데이터만)
    const isLoading = shelterLoading || statsLoading;

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