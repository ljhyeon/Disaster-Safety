import { Tag, Table, Button, } from 'antd';

export const ShippingTable = ({ data, onOpenModal }) => {
    const columns = [
        {
            title: '운송장 번호',
            dataIndex: 'tracking_number',
            key: 'tracking_number',
            width: 140,
        },
        {
            title: '배송 ID',
            dataIndex: 'deliveryId',
            key: 'deliveryId',
            width: 120,
        },
        {
            title: '배송일자',
            dataIndex: 'delivery_completed_at',
            key: 'delivery_completed_at',
            width: 100,
        },
        {
            title: '공급자',
            dataIndex: 'supplier',
            key: 'supplier',
            width: 120,
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status) => {
                let color = 'default';
                let fontColor = 'black';
                if (status === '배송완료') {
                    color = '#DCFCE7';
                    fontColor = '#166534';
                }
                else if (status === '대기중') {
                    color = '#F3F4F6';
                    fontColor = '#1F2937';
                }
                return <Tag color={color} style={{ border: 0, borderRadius: 9999, color: fontColor, }}>{status}</Tag>;
            },
        },
        {
            title: '품목 수',
            dataIndex: 'matched_quantity',
            key: 'matched_quantity',
            width: 80,
            render: (q) => `${q}개`,
        },
        {
            title: '수량 상태',
            dataIndex: 'receiveStatus',
            key: 'receiveStatus',
            width: 90,
            render: (status) => {
                const color = status === '일치' ? '#DCFCE7' : '#FEF9C3';
                const fontColor = status === '일치' ? '#166534' : '#854D0E';
                return <Tag color={color} style={{ border: 0, borderRadius: 9999, color: fontColor, }}>{status}</Tag>;
            },
        },
        {
            title: '검수 상태',
            dataIndex: 'checkStatus',
            key: 'checkStatus',
            width: 90,
            render: (checkStatus) => {
                const color = checkStatus === '검수완료' ? '#DCFCE7' : '#FEE2E2';
                const fontColor = checkStatus === '검수완료' ? '#166534' : '#991B1B';
                return <Tag color={color} style={{ border: 0, borderRadius: 9999, color: fontColor }}>{checkStatus}</Tag>;
            },
        },
        {
            title: '작업',
            key: 'action',
            width: 100,
            render: (_, record) => {
                const isCompleted = record.checkStatus === '검수완료';
                const isShipped = record.status === '배송완료';

                if (isCompleted) {
                    return (
                        <Button
                            type="primary"
                            size="small"
                            disabled
                            style={{ backgroundColor: '#979797', color: 'white' }}
                        >
                            검수완료
                        </Button>
                    );
                }

                return (
                    <Button
                        type="primary"
                        danger
                        size="small"
                        onClick={() => onOpenModal(record)}
                        disabled={!isShipped}
                    >
                        검수하기
                    </Button>
                );
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            bordered
            size="middle"
        />
    );
}
