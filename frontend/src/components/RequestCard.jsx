import { Progress, Typography, Row, Col, Tag, Modal, Table, Divider } from 'antd';
import { useState } from 'react';
import '../styles/requestCard.css'
import { COLORS } from '../styles/colors'

const { Text, Title } = Typography;

const RequestCard = ({ data }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 배송 상태에 따른 색상 및 텍스트 설정
  const getStatusConfig = (status, progress) => {
    if (status === 'completed' || progress >= 100) {
      return {
        color: '#52c41a', // 녹색
        text: '배송완료',
        tagColor: 'success'
      };
    } else if (status === 'in_progress' || progress >= 50) {
      return {
        color: '#1890ff', // 파란색
        text: '배송중',
        tagColor: 'processing'
      };
    } else {
      return {
        color: '#f5222d', // 빨간색
        text: '배송대기',
        tagColor: 'error'
      };
    }
  };

  const statusConfig = getStatusConfig(data.status, data.progress);

  // 모달 열기/닫기
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 상세 정보 테이블 컬럼 정의
  const columns = [
    {
      title: '구호품명',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '요청량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: '배송량',
      dataIndex: 'supplied_quantity',
      key: 'supplied_quantity',
      render: (text, record) => `${text || 0} ${record.unit}`,
    },
    {
      title: '배송률',
      dataIndex: 'supply_rate',
      key: 'supply_rate',
      render: (text) => (
        <Progress 
          percent={text || 0} 
          size="small" 
          strokeColor={text >= 100 ? '#52c41a' : text >= 50 ? '#1890ff' : '#f5222d'}
        />
      ),
    },
  ];

  return (
    <>
      <div className="request-card" onClick={showModal} style={{ cursor: 'pointer' }}>
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

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title level={4} style={{ margin: 0 }}>구호품 배송 상세 현황</Title>
            <Tag color={statusConfig.tagColor}>{statusConfig.text}</Tag>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Divider />
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text type="secondary">요청 ID</Text>
              <br />
              <Text strong>{data.id}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">요청일시</Text>
              <br />
              <Text>{data.requestDate}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">전체 배송률</Text>
              <br />
              <Text style={{ color: statusConfig.color, fontWeight: 'bold', fontSize: '16px' }}>
                {data.progress}%
              </Text>
            </Col>
          </Row>
        </div>
        
        <Divider />
        
        <Title level={5}>구호품 항목별 배송 현황</Title>
        <Table
          columns={columns}
          dataSource={data.supplyDetails || []}
          rowKey={(record) => `${record.category}-${record.item}`}
          pagination={false}
          size="small"
        />
      </Modal>
    </>
  );
};

export default RequestCard;
