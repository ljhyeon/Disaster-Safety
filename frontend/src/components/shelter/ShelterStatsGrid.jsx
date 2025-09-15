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
                {/* TODO: 재고 소진 예상일 을 위한 정보 별도 필요 */}
                <DonutChart 
                    title="재고 소진 예상일" 
                    value={statistics?.remainDate ?? 0} 
                    color={COLORS.primary} 
                    unit='일'
                />
            </Col>
        </Row>
    )
}