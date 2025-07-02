import { useNavigate } from 'react-router-dom'
import { Button, Typography, } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useShelterStore } from '../store/useShelterStore'
import { RequestCardList } from '../components/RequestCardList'

const { Title, } = Typography

import { productInfo } from '../dummydata/productData';

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
            <RequestCardList data={productInfo} />

        </>
    )
}

export default ProductList;