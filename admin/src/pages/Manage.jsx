import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Tag, Button, Typography, Space, Select, Input, Modal, Spin, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

import { Modify } from '../components/modals/Modify';
import AddInventoryItemForm from '../components/forms/AddInventoryItemForm';
import {
    getShelterInventory,
    updateInventoryItem,
    addInventoryItem,
    getInventoryStatistics
} from '../services/inventoryService';
import { RELIEF_CATEGORIES, RELIEF_SUBCATEGORIES } from '../services/reliefService';

const ReliefSuppliesManagement = () => {
    const { id: shelterId } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // 통계 계산
    const criticalCount = data.filter(d => d.urgencyLevel === '높음').length;
    const warningCount = data.filter(d => d.urgencyLevel === '중간').length;
    const sufficientCount = data.filter(d => d.urgencyLevel === '낮음').length;
    const totalDeficit = data.reduce((sum, item) => sum + (item.deficitQuantity || 0), 0);

    useEffect(() => {
        loadInventory();
    }, [shelterId]);

    const loadInventory = async () => {
        if (!shelterId) return;

        setLoading(true);
        try {
            const [inventoryResult, statsResult] = await Promise.all([
                getShelterInventory(shelterId),
                getInventoryStatistics(shelterId)
            ]);

            if (inventoryResult.success) {
                const inventoryItems = inventoryResult.inventory.itemsArray || [];

                // 테이블 데이터 형식으로 변환
                const formattedData = inventoryItems.map((item, index) => ({
                    key: item.key || `item_${index}`,
                    suppliesName: item.item_name,
                    category: item.category,
                    subcategory: item.subcategory,
                    urgencyLevel: item.urgencyLevel,
                    currentQuantity: item.current_quantity || 0,
                    expectedQuantity: item.minimum_required || 0,
                    deficitQuantity: item.deficitQuantity || 0,
                    fulfillmentRate: item.fulfillmentRate,
                    unit: item.unit,
                    maximum_capacity: item.maximum_capacity
                }));

                setData(formattedData);
            } else {
                message.error(inventoryResult.error?.message || '재고 데이터를 불러오는데 실패했습니다.');
            }

            if (statsResult.success) {
                setStatistics(statsResult.statistics);
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
            message.error('재고 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

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
        setSelectedItem(record);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleUpdateItem = async (updatedData) => {
        if (!selectedItem) return;

        try {
            const itemKey = selectedItem.key;
            const updateData = {
                current_quantity: updatedData.currentQuantity,
                minimum_required: updatedData.expectedQuantity,
                maximum_capacity: updatedData.maximum_capacity,
                updated_by: 'admin'
            };

            const result = await updateInventoryItem(shelterId, itemKey, updateData);

            if (result.success) {
                message.success('재고 정보가 업데이트되었습니다.');
                await loadInventory();
            } else {
                message.error(result.error?.message || '재고 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.error('Update error:', error);
            message.error('재고 업데이트 중 오류가 발생했습니다.');
        }

        closeModal();
    };

    const handleAddItem = async (itemData) => {
        try {
            const result = await addInventoryItem(shelterId, itemData);

            if (result.success) {
                message.success('새 재고 항목이 추가되었습니다.');
                await loadInventory();
            } else {
                message.error(result.error?.message || '재고 항목 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Add item error:', error);
            message.error('재고 항목 추가 중 오류가 발생했습니다.');
        }

        setIsAddModalOpen(false);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }
    
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={1} style={{ margin: 0 }}>현재 구호품 재고 관리</Title>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadInventory}
                    >
                        새로고침
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        항목 추가
                    </Button>
                </Space>
            </div>

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
                    총 {data.length}건
                </Tag>
                <Tag style={{
                    color: '#B91C1C',
                    backgroundColor: '#FEE2E2',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    긴급: {criticalCount}건
                </Tag>
                <Tag style={{
                    color: '#A16207',
                    backgroundColor: '#FEF9C3',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    주의: {warningCount}건
                </Tag>
                <Tag style={{
                    color: '#15803D',
                    backgroundColor: '#DCFCE7',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    충분: {sufficientCount}건
                </Tag>
                <Tag style={{
                    color: '#6B21A8',
                    backgroundColor: '#F3E8FF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: '14px'
                }}>
                    총 부족: {totalDeficit}개
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
                handleSubmit={handleUpdateItem}
            />

            {/* 항목 추가 모달 */}
            <Modal
                title="새 재고 항목 추가"
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                footer={null}
                width={600}
            >
                <AddInventoryItemForm
                    onSubmit={handleAddItem}
                    onCancel={() => setIsAddModalOpen(false)}
                    categories={RELIEF_CATEGORIES}
                    subcategories={RELIEF_SUBCATEGORIES}
                />
            </Modal>
        </>
    );
};

export default ReliefSuppliesManagement;