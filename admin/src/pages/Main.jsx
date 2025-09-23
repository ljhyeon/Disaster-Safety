import { Typography, Row, Col, } from 'antd';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShelterStatsGrid } from '../components/shelter/ShelterStatsGrid';
import NotificationList from '../components/notification/NotificationList';
import ShelterInfoCard from '../components/shelter/ShelterInfoCard';
import ReliefInfoCard from '../components/shelter/ReliefInfoCard';
import { useShelterStore } from '../store/useShelterStore';
import { useShelter } from '../hooks/shelter/useShelter';
import { useReliefStatistics } from '../hooks/relief/useReliefStatistics';
import { useNotifications } from '../hooks/relief/useNotifications';
import { getTopNeededItems, getRecentDeliveryNotifications } from '../services/dashboardService';

const { Title, } = Typography;

const Main = () => {
    const selectedId = useShelterStore((s)=>s.selectedId);
    const [topNeededItems, setTopNeededItems] = useState([]);
    const [deliveryNotifications, setDeliveryNotifications] = useState([]);
    const [loadingTopItems, setLoadingTopItems] = useState(true);

    const { shelter, isLoading: shelterLoading } = useShelter(selectedId);
    const { statistics, reliefSupplyRate, isLoading: statsLoading } = useReliefStatistics(selectedId);
    const { notifications } = useNotifications(selectedId);

    // 우선 필요 용품과 배송 알림 로드
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!selectedId) return;

            setLoadingTopItems(true);
            try {
                // 우선 필요 용품 TOP 5
                const items = await getTopNeededItems(selectedId);
                setTopNeededItems(items);

                // 최근 배송 알림
                const notificationsResult = await getRecentDeliveryNotifications(selectedId);
                if (notificationsResult.success) {
                    setDeliveryNotifications(notificationsResult.notifications);
                }
            } catch (error) {
                console.error('대시보드 데이터 로드 실패:', error);
            } finally {
                setLoadingTopItems(false);
            }
        };

        loadDashboardData();
    }, [selectedId]);

    // 로딩 상태 확인 (필수 데이터만)
    const isLoading = shelterLoading || statsLoading || loadingTopItems;

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
            <ShelterStatsGrid
                shelter={shelter}
                statistics={statistics}
                reliefSupplyRate={reliefSupplyRate}
            />

            {/* 상세 정보 카드 */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} md={12}>
                    <ShelterInfoCard shelter={shelter} />
                </Col>
                <Col xs={24} md={12}>
                    <ReliefInfoCard items={topNeededItems} />
                </Col>
            </Row>

            <NotificationList title="알림마당" notifications={deliveryNotifications.length > 0 ? deliveryNotifications : notifications} />
        </>
    )
}

export default Main;