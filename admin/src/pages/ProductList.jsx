import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RequestCardList } from '../components/RequestCardList';
import { useShelterStore } from '../store/useShelterStore';
import { useReliefRequests } from '../hooks/relief/useReliefRequests';

const { Title, } = Typography;

const ProductList = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const selectedId = useShelterStore((s)=>s.selectedId);
    const setSelectedId = useShelterStore((s)=>s.setSelectedId);
    const [deletedIds, setDeletedIds] = useState(new Set());

    // URL 파라미터의 id를 store에 설정
    useEffect(() => {
        if (id && id !== selectedId) {
            setSelectedId(id);
        }
    }, [id, selectedId, setSelectedId]);

    // 현재 대피소 ID 결정
    const currentShelterId = selectedId || id;

    // 구호품 요청 목록 로드
    const { requests, isLoading, refetch } = useReliefRequests(currentShelterId);

    // 삭제된 항목 필터링
    const filteredRequests = requests.filter(req => !deletedIds.has(req.id));

    const handleAdd = () => {
        navigate(`/add/${currentShelterId}`);
    }

    const handleDelete = (requestId) => {
        // 삭제된 ID 추가
        setDeletedIds(prev => new Set([...prev, requestId]));
        // 데이터 리프레시
        if (refetch) {
            refetch();
        }
    }

    // 로딩 중일 때 표시
    if (isLoading) {
        return <LoadingSpinner text="구호품 요청 목록을 불러오는 중..." />
    }

    // 대피소가 선택되지 않은 경우
    if (!currentShelterId) {
        return <LoadingSpinner text="대피소 정보를 확인하는 중..." />
    }
    
    return (
        <>
            <Title level={1}>
                구호품 현황
            </Title>

            <Button
                style={{ width: '100%', height: '60px', marginBottom: '24px' }}
                onClick={handleAdd}
            >
                <PlusOutlined />
                구호품 요청 추가
            </Button>

            <RequestCardList cnt={filteredRequests.length} data={filteredRequests} onDelete={handleDelete} />
        </>
    )
}

export default ProductList;