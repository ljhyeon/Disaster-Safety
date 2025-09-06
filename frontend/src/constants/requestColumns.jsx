// constants/requestColumns.ts
export const REQUEST_TABLE_COLUMNS = () => [
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
