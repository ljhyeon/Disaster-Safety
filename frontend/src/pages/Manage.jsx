import { useState } from 'react';
import { Table, Tag, Button, Typography, Space, Select, Input, Modal } from 'antd';

const { Title } = Typography;

import { Modify } from '../components/modals/Modify';
import { managingData } from '../dummydata/managingData';

const ReliefSuppliesManagement = () => {
    // 더미 데이터
    const [data, setData] = useState(managingData);

    // 통계 계산
    const totalCount = data.length;
    const unInspectedCount = data.filter(d => d.checkStatus === '미검수').length;
    const inspectedCount = data.filter(d => d.checkStatus === '검수완료').length;
    const mismatchCount = data.filter(d => d.receiveStatus === '불일치').length;

    // 긴급도 태그 색상
    const getUrgencyColor = (level) => {
        switch (level) {
            case '높음': return '#FFE6E6';
            case '중간': return '#E6EDFF';
            case '낮음': return '#FFFCEF';
        }
    };

    const getUrgencyFontColor = (level) => {
        switch (level) {
            case '높음': return '#A0141D';
            case '중간': return '#2E14A0';
            case '낮음': return '#E29E00';
        }
    };

    const columns = [
        {
            title: '구호품',
            dataIndex: 'suppliesName',
            key: 'suppliesName',
            width: 150,
        },
        {
            title: '긴급도',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            width: 100,
            render: (level) => (
                <Tag color={getUrgencyColor(level)} style={{ borderRadius: 12, color: getUrgencyFontColor(level), }}
                >
                {level}
                </Tag>
            ),
        },
        {
            title: '현재 수량',
            dataIndex: 'currentQuantity',
            key: 'currentQuantity',
            width: 120,
            render: (quantity) => `${quantity}개`,
        },
        {
            title: '예상 필요 수량',
            dataIndex: 'expectedQuantity',
            key: 'expectedQuantity',
            width: 140,
            render: (quantity) => `${quantity}개`,
        },
        {
            title: '부족 수량',
            dataIndex: 'deficitQuantity',
            key: 'deficitQuantity',
            width: 120,
            render: (quantity) => `${quantity}개`,
        },
        {
            title: '충족률',
            dataIndex: 'fulfillmentRate',
            key: 'fulfillmentRate',
            width: 100,
            render: (rate) => (
                <span style={{ 
                    color: parseInt(rate) >= 80 ? '#66BB6A' : '#FF6B6B',
                    fontWeight: 600
                }}>
                {rate}
                </span>
            ),
        },
        {
            title: '작업',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Button
                type="primary"
                size="small"
                onClick={() => openModal(record)}
                style={{
                    borderRadius: 6,
                    fontSize: '12px',
                    height: 28
                }}
                >
                    수정하기
                </Button>
            ),
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openModal = (record) => {
        console.log(record)
        setSelectedItem(record);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };
    
    return (
        <>
            <Title level={1}>현재 구호품 재고 관리</Title>
            
            {/* 상태 통계 태그들 */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <Tag style={{ 
                    color: '#374151', 
                    backgroundColor: '#F3F4F6',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    총 {totalCount}건
                </Tag>
                <Tag style={{ 
                    color: '#B91C1C', 
                    backgroundColor: '#FEE2E2',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    미검수: {unInspectedCount}건
                </Tag>
                <Tag style={{ 
                    color: '#15803D', 
                    backgroundColor: '#DCFCE7',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    검수완료: {inspectedCount}건
                </Tag>
                <Tag style={{ 
                    color: '#A16207', 
                    backgroundColor: '#FEF9C3',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    수량 불일치: {mismatchCount}건
                </Tag>
            </div>

            {/* 테이블 */}
            <Table
                columns={columns}
                dataSource={data}
                pagination={{
                    current: 1,
                    pageSize: 10,
                    total: data.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}건`,
                    style: { marginTop: 16 }
                }}
                scroll={{ x: 800 }}
                style={{ 
                    backgroundColor: 'white',
                    borderRadius: 8
                }}
                rowClassName={(record, index) => 
                    index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                }
            />

            <Modify
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                selectedItem={selectedItem}
                handleSubmit={()=>{
                    // 추가 제출 로직 필요
                    closeModal();
                }}
            />
        </>
    );
};

export default ReliefSuppliesManagement;