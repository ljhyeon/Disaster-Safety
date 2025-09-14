import { useState } from 'react';
import { Typography, Tag, } from 'antd';
import { shippingData as initialData } from '../dummydata/shippingData';
import { ShippingTable } from '../components/tables/shipping';
import { Checking } from '../components/modals/Checking';

const { Title, } = Typography;

const Check = () => {
    const [data, setData] = useState(initialData);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [inspectionData, setInspectionData] = useState({});

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

    const handleInspectionComplete = () => {
        // 검수 완료 처리
        const updatedData = data.map(item => {
            if (item.key === selectedDelivery.key) {
                return {
                    ...item,
                    checkStatus: '검수완료',
                    receiveStatus: '일치' // 검수 후에는 일치로 변경
                };
            }
            return item;
        });
        setData(updatedData);
        closeModal();
    };

    return (
        <>
            <Title level={1}>배송 완료 검수 및 재고 반영</Title>

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