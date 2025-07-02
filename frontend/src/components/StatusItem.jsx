import { Avatar, Typography, Divider } from 'antd'

const { Text } = Typography

const StatusItem = ({ data }) => {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
            {/* 콘텐츠 라인 */}
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar
                    src="https://i.pravatar.cc/40?img=1" // 예시 이미지
                    size={40}
                    style={{ marginRight: 12 }}
                />
                <div style={{ flex: 1 }}>
                <Text style={{ color: '#434343' }}>
                    {data}
                </Text>
                </div>
            </div>
            <Divider style={{ margin: '8px 0' }} />
        </div>
    )
}

export default StatusItem
