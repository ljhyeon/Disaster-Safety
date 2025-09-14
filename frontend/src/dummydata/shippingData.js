export const shippingData = [
    {
        key: '1',
        trackingNumber: '1234567890123',
        deliveryId: 'DEL-2024-001',
        deliveryDate: '2024.01.15',
        supplier: '대한적십자사',
        status: '배송완료',
        quantity: 3,
        receiveStatus: '불일치',
        checkStatus: '미검수',
        items: [
            { name: '생수 500ml', expected: 60 },
            { name: '일회용 부대', expected: 30 },
            { name: '알카라인 건전지 AA', expected: 20 }
        ]
    },
    {
        key: '2',
        trackingNumber: '2345678901234',
        deliveryId: 'DEL-2024-002',
        deliveryDate: '2024.01.16',
        supplier: '굿네이버스',
        status: '배송완료',
        quantity: 2,
        receiveStatus: '일치',
        checkStatus: '검수완료',
        items: [
            { name: '담요', expected: 50 },
            { name: '구급약품 세트', expected: 25 }
        ]
    },
    {
        key: '3',
        trackingNumber: '3456789012345',
        deliveryId: 'DEL-2024-003',
        deliveryDate: '2024.01.17',
        supplier: '월드비전',
        status: '배송완료',
        quantity: 4,
        receiveStatus: '불일치',
        checkStatus: '미검수',
        items: [
            { name: '비상식량', expected: 100 },
            { name: '손전등', expected: 40 },
            { name: '라디오', expected: 15 },
            { name: '배터리 팩', expected: 60 }
        ]
    },
    {
        key: '4',
        trackingNumber: '4567890123456',
        deliveryId: 'DEL-2024-004',
        deliveryDate: '2024.01.18',
        supplier: '유니세프',
        status: '대기중',
        quantity: 1,
        receiveStatus: '일치',
        checkStatus: '미검수',
        items: [
            { name: '응급처치 키트', expected: 30 }
        ]
    },
];