import { useEffect, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RequestCardList } from '../components/RequestCardList';


const { Title, } = Typography;

const Manage = () => {
    return (
        <div>
            재고 관리
        </div>
    )
}

export default Manage;