import { Avatar, Typography, Divider } from 'antd'

const { Text } = Typography

const NotificationItem = ({ data }) => {
    const now = new Date();
    
    const diffMs = data.create_at ? now.getTime() - data.create_at.getTime() : null;
    const diffHours = diffMs ? Math.floor(diffMs / (1000 * 60 * 60)) : null;

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
            <Text strong>{data.user_name} 님</Text>이 필요 구호품 중 <Text strong>[{data.relief_item}]</Text>를{' '}
            <Text strong>{data.relief_count}</Text> {data.type}하였습니다.
            {/* type: 등록 / 기부 */}
          </Text>
          { diffHours && <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{diffHours}시간 전</div> }
        </div>
      </div>
      <Divider style={{ margin: '8px 0' }} />
    </div>
  )
}

export default NotificationItem
