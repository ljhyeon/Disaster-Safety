import { Typography, } from 'antd'

const { Title, Text } = Typography

export const Logo = () => {
    return (
        <div style={{ textAlign: 'center',}}>
            <Title level={1}>
                이어드림
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                재난상황 내 구호품 중계 플랫폼
            </Text>
        </div>
    )
}