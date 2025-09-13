import { useEffect, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RequestCardList } from '../components/RequestCardList';


const { Title, } = Typography;

const Check = () => {
    return (
        <div>
            배송 검수
        </div>
    )
}

export default Check;