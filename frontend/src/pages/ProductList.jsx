import { useNavigate } from 'react-router-dom'
import { Button, Typography, } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useShelterStore } from '../store/useShelterStore'
import { RequestCardList } from '../components/RequestCardList'

const { Title, } = Typography

import { COLORS } from '../styles/colors'

// 데이터 타입 정의
const mockData = [
    {
        id: 1,
        name: '생수',
        description: '크기 관계 없음/ 페트 재질',
        requestDate: '2016-06-16 14:03',
        currentStock: 0,
        targetStock: 500,
        progress: 50,
        status: '요청량'
    },
    {
        id: 2,
        name: '휴지',
        description: '조건없음',
        requestDate: '2016-06-16 14:03',
        currentStock: 0,
        targetStock: 500,
        progress: 30,
        status: '요청량'
    },
    {
        id: 3,
        name: '물티슈',
        description: '조건없음',
        requestDate: '2016-06-16 14:03',
        currentStock: 0,
        targetStock: 500,
        progress: 60,
        status: '요청량'
    },
    {
        id: 4,
        name: '이불',
        description: '크기 관계 없음/ 페트 재질',
        requestDate: '2016-06-16 14:03',
        currentStock: 0,
        targetStock: 500,
        progress: 50,
        status: '요청량'
    },
    {
        id: 5,
        name: '텐트',
        description: '4인 이상',
        requestDate: '2016-06-16 14:03',
        currentStock: 0,
        targetStock: 500,
        progress: 0,
        status: '요청량'
    },
    {
        id: 6,
        name: '참치캔',
        description: '통조림',
        requestDate: '2016-06-16 14:03',
        currentStock: 0,
        targetStock: 500,
        progress: 10,
        status: '요청량'
    }
];

const ProductList = () => {
    const navigate = useNavigate()
    const selectedId = useShelterStore((s)=>s.selectedId)

    const handleAdd = () => {
        navigate(`/add/${selectedId}`)
    };
    
    return (
        <>
            <Title level={1}>
                구호품 현황
            </Title>

            <Button
                style={{ width: '100%', height: '60px' }}
                onClick={handleAdd}
            >
                <PlusOutlined />
                추가
            </Button>
            <RequestCardList data={mockData} />

        </>
    )
}

export default ProductList;