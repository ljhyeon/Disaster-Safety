import { Row, Col, } from 'antd';
import { COLORS } from '../../styles/colors';
import DonutChart from '../DonutChart';

export const ShelterStatsGrid = ({ shelter, statistics, reliefSupplyRate }) => {
    return (
        <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={12} md={8}>
                <DonutChart title="수용 인원률" value={shelter.occupancy_rate} color={COLORS.primaryLight} />
            </Col>
            <Col xs={24} sm={12} md={8}>
                <DonutChart title="구호품 공급률" value={reliefSupplyRate} color={COLORS.primaryHover} />
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
    )
}