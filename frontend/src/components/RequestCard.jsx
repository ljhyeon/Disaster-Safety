import { Progress, Typography, Row, Col } from 'antd';
import '../styles/requestCard.css'
import { COLORS } from '../styles/colors'

const { Text } = Typography;

const RequestCard = ({ data }) => {
  return (
    <div className="request-card">
      <div className="left-bar" />
      <div className="content">
        <Row>
          <Col span={12}>
            <Text strong>{data.name}</Text>
            <br />
            <Text type="secondary">{data.description}</Text>
          </Col>
          <Col span={6}>
            <Text type="secondary">요청일시</Text>
            <br />
            <Text>{data.requestDate}</Text>
          </Col>
          <Col span={6}>
            <Text type="secondary">요청량</Text>
            <Progress
              percent={data.progress}
              showInfo={false}
              strokeColor={COLORS.primary}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">{data.currentStock}</Text>
              <Text type="secondary">{data.targetStock}</Text>
              <Text type="secondary">{data.progress}%</Text>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RequestCard;
