
import { Typography, Button, Modal, Input, Space, Row, Col, Alert, Tag } from 'antd';
import { CloseOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const Checking = ({ isModalOpen, closeModal, selectedDelivery, inspectionData, handleQuantityChange, handleReasonChange, handleInspectionComplete }) => {

    return (
        <Modal
            open={isModalOpen}
            title={
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    배송 검수 - {selectedDelivery?.deliveryId}
                </div>
            }
            onCancel={closeModal}
            closeIcon={<CloseOutlined style={{ fontSize: '14px' }} />}
            footer={[
                <Button key="cancel" onClick={closeModal}>
                    취소
                </Button>,
                <Button 
                    key="confirm" 
                    type="primary" 
                    danger
                    onClick={handleInspectionComplete}
                    style={{ backgroundColor: '#ff4d4f' }}
                >
                    검수 확정 및 재고 반영
                </Button>,
            ]}
            width={640}
            styles={{
                header: { paddingBottom: '12px' },
                body: { paddingTop: '16px' }
            }}
        >
            {selectedDelivery && (
                <>
                    {/* 기본 정보 */}
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px', marginBottom: '24px', }}>
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <Text type="secondary">운송장 번호: </Text>
                                <Tag style={{ marginLeft: '4px', fontSize: '12px' }}>
                                    {selectedDelivery.trackingNumber}
                                </Tag>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">배송일자: </Text>
                                <Text strong>{selectedDelivery.deliveryDate}</Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">공급자: </Text>
                                <Text strong>{selectedDelivery.supplier}</Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">총 품목 수: </Text>
                                <Text strong>{selectedDelivery.quantity}개</Text>
                            </Col>
                        </Row>
                    </div>

                    {/* 품목별 검수 타이틀 */}
                    <Title level={4} style={{ marginBottom: '8px', fontSize: '16px' }}>
                        품목별 검수
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>
                        재고에 반영할 수량을 확인하고 수정해주세요. 파손이나 분실로 인한 수량 차이가 있을 경우 이유를 기록해주세요.
                    </Text>

                    {/* 품목 목록 */}
                    {selectedDelivery.items.map((item, index) => {
                        const key = `item${index + 1}`;
                        const actualValue = inspectionData[key]?.actual ?? item.expected.toString();
                        const hasDiscrepancy = parseInt(actualValue) !== item.expected;
                        const difference = Math.abs(parseInt(actualValue) - item.expected);
                        
                        return (
                            <div key={key} style={{ 
                                border: '1px solid #f0f0f0', 
                                borderRadius: '8px', 
                                padding: '16px', 
                                marginBottom: '16px' 
                            }}>
                                <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                                    <Text strong style={{ fontSize: '14px' }}>{item.name}</Text>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        예상 수량: {item.expected} 개
                                    </Text>
                                </Row>

                                <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        <span style={{ color: '#ff4d4f' }}>* </span>
                                        재고 반영 수량
                                    </Text>
                                    <Space align="center">
                                        <Input
                                        value={actualValue}
                                        onChange={(e) => handleQuantityChange(key, e.target.value)}
                                        style={{ width: '80px', textAlign: 'center' }}
                                        size="small"
                                        />
                                        <span style={{ fontSize: '13px' }}>개</span>
                                    </Space>
                                </Row>

                                {/* 수량 불일치 경고 - 조건부 렌더링 */}
                                {hasDiscrepancy && (
                                    <div style={{ 
                                        backgroundColor: '#fff7e6', 
                                        border: '1px solid #ffd666', 
                                        borderRadius: '6px', 
                                        padding: '8px 12px', 
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '14px' }} />
                                        <Text style={{ fontSize: '12px', color: '#d48806' }}>
                                            수량 불일치: 차이 {difference} 개
                                        </Text>
                                    </div>
                                )}

                                {/* 수량 차이 이유 입력란 - 조건부 렌더링 */}
                                {hasDiscrepancy && (
                                    <Col span={24}>
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            <span style={{ color: '#ff4d4f' }}>* </span>
                                            수량 차이 이유
                                        </Text>
                                        <TextArea
                                            value={inspectionData[key]?.reason || ''}
                                            onChange={(e) => handleReasonChange(key, e.target.value)}
                                            placeholder="포장 파손으로 손실"
                                            rows={3}
                                            style={{ marginTop: '4px', fontSize: '12px' }}
                                            showCount
                                            maxLength={100}
                                        />
                                    </Col>
                                )}
                            </div>
                        );
                    })}

                    {/* 검수 확정 알림 */}
                    <Alert
                        message="검수 확정 시 해당 품목들이 재고에 자동으로 반영됩니다."
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        style={{ 
                            marginTop: '16px',
                            fontSize: '13px',
                            backgroundColor: '#f6ffed',
                            border: '1px solid #b7eb8f'
                        }}
                    />
                </>
            )}
        </Modal>
    )
}