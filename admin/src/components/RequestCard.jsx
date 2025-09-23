import { Progress, Typography, Row, Col, Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getStatusConfig } from '../utils/requestStatus';
import { deleteReliefRequest } from '../services/reliefService';
import '../styles/requestCard.css'

const { Text } = Typography;

const RequestCard = ({ data, onDelete }) => {
  const statusConfig = getStatusConfig(data.status, data.progress);

  const handleDelete = async () => {
    try {
      const result = await deleteReliefRequest(data.id);
      if (result.success) {
        message.success('구호품 요청이 삭제되었습니다.');
        if (onDelete) {
          onDelete(data.id);
        }
      } else {
        message.error(result.error?.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      message.error('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <div className="request-card" style={{ cursor: 'default', position: 'relative' }}>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            color: '#999',
            fontSize: '12px',
            padding: '2px',
            width: '20px',
            height: '20px',
            minWidth: '20px'
          }}
        />
        <div className="content">
          <Row gutter={16} align="middle">
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Text strong style={{ fontSize: '16px' }}>{data.name}</Text>
              </div>
              <Text style={{ fontSize: '14px' }} type="secondary">{data.description}</Text>
            </Col>
            <Col span={4}>
              <Text style={{ fontSize: '14px' }} type="secondary">요청일시</Text>
              <br />
              <Text style={{ fontSize: '16px' }}>{data.requestDate}</Text>
            </Col>
            <Col span={4}>
              <Text type="secondary">요청량</Text>
              <Progress
                percent={data.progress}
                showInfo={false}
                strokeColor={statusConfig.color}
                size="small"
                style={{ marginTop: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <Text type="secondary">0</Text>
                <Text type="secondary">{data.targetStock}</Text>
              </div>
            </Col>
            <Col span={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0' }}>
              <Text type="secondary">달성량</Text>
              <Text strong style={{ fontSize: '24px', color: statusConfig.color }}>
                {data.progress}%
              </Text>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default RequestCard;
