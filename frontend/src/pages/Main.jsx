import { Typography, Row, Col } from 'antd'

const { Title, } = Typography

import { COLORS } from '../styles/colors'
import DonutChart from '../components/DonutChart'
import { NotificationList } from '../components/NotificationList'

const Main = () => {
    // dummy data
    const notificationData = [
        {
            user_name: '홍길동',
            relief_item: '생수',
            relief_count: '100개',
            type: '등록',
            create_at: new Date(2025, 6, 1, 18, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '담요',
            relief_count: '100장',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '통조림',
            relief_count: '300캔',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '담요',
            relief_count: '100장',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '통조림',
            relief_count: '300캔',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '담요',
            relief_count: '100장',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '통조림',
            relief_count: '300캔',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '담요',
            relief_count: '100장',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '통조림',
            relief_count: '300캔',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '담요',
            relief_count: '100장',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
        {
            user_name: '홍길동',
            relief_item: '통조림',
            relief_count: '300캔',
            type: '등록',
            create_at: new Date(2025, 6, 1, 20, 0, 0, 0)
        },
    ]

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