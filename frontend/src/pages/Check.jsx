// pages/Check.tsx
import { Typography, Tag, Table, Button } from 'antd';

const { Title } = Typography;

const data = [
    {
        key: '1',
        trackingNumber: '1234567890123',
        deliveryId: 'DEL-2024-001',
        deliveryDate: '2024.01.15',
        supplier: '한국적십자사',
        status: '배송완료',
        quantity: 3,
        receiveStatus: '일치',
        checkStatus: '검수완료',
    },
    {
        key: '2',
        trackingNumber: '2345678901234',
        deliveryId: 'DEL-2024-001',
        deliveryDate: '2024.01.16',
        supplier: '굿네이버스',
        status: '배송완료',
        quantity: 5,
        receiveStatus: '불일치',
        checkStatus: '미검수',
    },
    {
        key: '3',
        trackingNumber: '2345678901234',
        deliveryId: 'DEL-2024-002',
        deliveryDate: '2024.01.16',
        supplier: '굿네이버스',
        status: '대기중',
        quantity: 5,
        receiveStatus: '불일치',
        checkStatus: '미검수',
    },
];

const Check = () => {
    const columns = [
        {
            title: '운송장 번호',
            dataIndex: 'trackingNumber',
            key: 'trackingNumber',
        },
        {
            title: '배송 ID',
            dataIndex: 'deliveryId',
            key: 'deliveryId',
        },
        {
            title: '배송일자',
            dataIndex: 'deliveryDate',
            key: 'deliveryDate',
        },
        {
            title: '공급자',
            dataIndex: 'supplier',
            key: 'supplier',
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = status === '배송완료' ? 'green' : 'default';
                return <Tag color={color} style={{ border: 0, borderRadius: 9999, }}>{status}</Tag>;
            },
        },
        {
            title: '품목 수',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (q) => `${q}개`,
        },
        {
            title: '수량 상태',
            dataIndex: 'receiveStatus',
            key: 'receiveStatus',
            render: (status) => {
                const color = status === '일치' ? 'blue' : 'orange';
                return <Tag color={color} style={{ border: 0, borderRadius: 9999, }}>{status}</Tag>;
            },
        },
        {
            title: '검수 상태',
            dataIndex: 'checkStatus',
            key: 'checkStatus',
            render: (status) => {
                const color = status === '검수완료' ? 'green' : 'red';
                return <Tag color={color} style={{ border: 0, borderRadius: 9999, }}>{status}</Tag>;
            },
        },
        {
            title: '작업',
            key: 'action',
            render: (_, record) =>
                record.checkStatus === '검수완료' ? (
                    <Button type="primary">상세보기</Button>
                ) : (
                    <Button color="danger" variant="solid">검수하기</Button>
                ),
            },
    ];

    return (
        <>
            <Title level={1}>배송 완료 검수 및 재고 반영</Title>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 16,
                }}
            >
                <Tag color="#F3F4F6" style={{ color: '#374151', borderRadius: 8 }}>
                    총 {data.length}건
                </Tag>
                <Tag color="#FEE2E2" style={{ color: '#B91C1C', borderRadius: 8 }}>
                    미검수: {data.filter((d) => d.checkStatus === '미검수').length}건
                </Tag>
                <Tag color="#DCFCE7" style={{ color: '#15803D', borderRadius: 8 }}>
                    검수완료: {data.filter((d) => d.checkStatus === '검수완료').length}건
                </Tag>
                <Tag color="#FEF9C3" style={{ color: '#A16207', borderRadius: 8 }}>
                    수량 불일치: {data.filter((d) => d.receiveStatus === '불일치').length}건
                </Tag>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 10 }}
                bordered
            />
        </>
    );
};

export default Check;
