import { Typography, Row, Col } from 'antd'

const { Title, } = Typography

import { COLORS } from '../styles/colors'
import DonutChart from '../components/DonutChart'
import { NotificationList } from '../components/NotificationList'

import { notificationData } from '../dummydata/notificationData'

const Main = () => {

    return (
        <>
            <Title level={1}>
                대피소 내 통계
            </Title>
            <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={12} md={8}>
                    <DonutChart title="수용 인원" value={28} color={COLORS.primaryLight} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <DonutChart title="환자 수용률" value={45} color={COLORS.primaryHover} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <DonutChart title="구호품 잔여율" value={32} color={COLORS.primary} />
                </Col>
            </Row>

            <NotificationList cnt={notificationData.length} data={notificationData} />
        </>
    )
}

export default Main;