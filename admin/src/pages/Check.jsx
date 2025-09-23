import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Tag, message, Spin, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ShippingTable } from "../components/tables/Shipping";
import { Checking } from '../components/modals/Checking';
import { getShippedSuppliesForInspection, processDeliveryInspection } from '../services/inventoryService';

const { Title, } = Typography;

const Check = () => {
    const { id: shelterId } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [inspectionData, setInspectionData] = useState({});

    useEffect(() => {
        loadShippedSupplies();
    }, [shelterId]);

    const loadShippedSupplies = async () => {
        if (!shelterId) return;

        setLoading(true);
        try {
            const result = await getShippedSuppliesForInspection(shelterId);
            if (result.success) {
                setData(result.supplies);
            } else {
                message.error(result.error?.message || '배송 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('Error loading supplies:', error);
            message.error('배송 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (record) => {
        setSelectedDelivery(record);
        setIsModalOpen(true);
        
        // 선택된 배송의 품목들로 초기 검수 데이터 설정
        const initialInspectionData = {};
        record.items.forEach((item, index) => {
            const key = `item${index + 1}`;
            initialInspectionData[key] = {
                actual: item.expected.toString(), // 기본값은 예상 수량과 동일
                reason: ''
            };
        });
        setInspectionData(initialInspectionData);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDelivery(null);
        setInspectionData({});
    };

    const handleQuantityChange = (item, value) => {
        setInspectionData(prev => ({
            ...prev,
            [item]: { ...prev[item], actual: value } // 문자열 그대로 저장
        }));
    };

    const handleReasonChange = (item, value) => {
        setInspectionData(prev => ({
            ...prev,
            [item]: { ...prev[item], reason: value }
        }));
    };

    const handleInspectionComplete = async () => {
        if (!selectedDelivery) return;

        try {
            // 검수 결과 데이터 준비
            const inspectionResults = selectedDelivery.items.map((item, index) => {
                const key = `item${index + 1}`;
                const data = inspectionData[key] || { actual: item.expected.toString(), reason: '' };

                return {
                    item_name: item.name,
                    category: item.category,
                    subcategory: item.subcategory,
                    unit: item.unit,
                    expected_quantity: item.expected,
                    actual_quantity: parseInt(data.actual) || 0,
                    discrepancy: (parseInt(data.actual) || 0) - item.expected,
                    discrepancy_reason: data.reason || null
                };
            });

            const deliveryData = {
                supply_id: selectedDelivery.supply_id,
                inspection_results: inspectionResults
            };

            // Firestore 업데이트
            const result = await processDeliveryInspection(deliveryData);

            if (result.success) {
                message.success('검수가 완료되고 재고가 업데이트되었습니다.');

                // UI 업데이트
                const updatedData = data.map(item => {
                    if (item.key === selectedDelivery.key) {
                        const hasDiscrepancy = inspectionResults.some(r => r.discrepancy !== 0);
                        return {
                            ...item,
                            checkStatus: '검수완료',
                            receiveStatus: hasDiscrepancy ? '불일치' : '일치',
                            inspection_status: 'completed',
                            inspection_data: inspectionResults
                        };
                    }
                    return item;
                });
                setData(updatedData);
            } else {
                message.error(result.error?.message || '검수 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Inspection error:', error);
            message.error('검수 처리 중 오류가 발생했습니다.');
        }

        closeModal();
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
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
            }}>
                <Title level={1} style={{ margin: 0 }}>배송 완료 검수 및 재고 반영</Title>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={loadShippedSupplies}
                >
                    새로고침
                </Button>
            </div>

            {/* 통계 태그들 */}
            <div style={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24,
            }}>
                <Tag color="#F3F4F6" style={{ color: '#374151', borderRadius: 8, padding: '4px 12px' }}>
                    총 {data.length}건
                </Tag>
                <Tag color="#FEE2E2" style={{ color: '#B91C1C', borderRadius: 8, padding: '4px 12px' }}>
                    미검수: {data.filter((d) => d.checkStatus === '미검수').length}건
                </Tag>
                <Tag color="#DCFCE7" style={{ color: '#15803D', borderRadius: 8, padding: '4px 12px' }}>
                    검수완료: {data.filter((d) => d.checkStatus === '검수완료').length}건
                </Tag>
                <Tag color="#FEF9C3" style={{ color: '#A16207', borderRadius: 8, padding: '4px 12px' }}>
                    수량 불일치: {data.filter((d) => d.receiveStatus === '불일치').length}건
                </Tag>
            </div>

            {/* 테이블 */}
            <ShippingTable data={data} onOpenModal={openModal} />

            {/* 배송 검수 모달 */}
            <Checking 
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                selectedDelivery={selectedDelivery}
                inspectionData={inspectionData}
                handleQuantityChange={handleQuantityChange}
                handleReasonChange={handleReasonChange}
                handleInspectionComplete={handleInspectionComplete}
            />
        </>
    );
};

export default Check;