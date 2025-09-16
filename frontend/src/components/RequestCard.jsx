import { Progress, Typography, Row, Col } from 'antd';
import { getStatusConfig } from '../utils/requestStatus';
import '../styles/requestCard.css'

const { Text } = Typography;

const RequestCard = ({ data }) => {
  const statusConfig = getStatusConfig(data.status, data.progress);

  return (
    <>
      <div className="request-card" style={{ cursor: 'default' }}>
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
