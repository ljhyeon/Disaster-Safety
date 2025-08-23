import { useEffect, useMemo, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RequestCardList } from '../components/RequestCardList';

const { Title, } = Typography;

import { useShelterStore } from '../store/useShelterStore';

import { getReliefRequestsWithSupplyStatus } from '../services/reliefService';

import { useAsync } from '../hooks/useAsync';

const ProductList = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const selectedId = useShelterStore((s)=>s.selectedId);
    const setSelectedId = useShelterStore((s)=>s.setSelectedId);

    // URL 파라미터의 id를 store에 설정
    useEffect(() => {
        if (id && id !== selectedId) {
            setSelectedId(id);
        }
    }, [id, selectedId, setSelectedId]);

    // 현재 대피소 ID 결정
    const currentShelterId = selectedId || id;

    // 구호품 요청 목록 로드
    const { data: requestsData, loading: isLoading } = useAsync(
        () => currentShelterId ? getReliefRequestsWithSupplyStatus(currentShelterId) : Promise.resolve(null),
        [currentShelterId],
        {
            errorMessage: '구호품 요청 목록을 불러올 수 없습니다.',
            onError: (error) => {
                console.error('구호품 요청 목록 조회 오류:', error);
                if (!currentShelterId) {
                    message.error('대피소가 선택되지 않았습니다.');
                    navigate('/home');
                }
            }
        }
    );

    // 데이터 변환 로직을 useMemo로 최적화
    const requests = useMemo(() => {
        if (!requestsData?.success || !requestsData?.requests) {
            return [];
        }
        
        // 배송 현황이 포함된 데이터를 RequestCard 형태로 변환
        return requestsData.requests.map((request) => {
            // 구호품 목록을 문자열로 변환
            const itemNames = request.relief_items.map(item => item.item).join(', ');
            
            return {
                id: request.request_id,
                name: itemNames,
                description: `${request.relief_items.length}개 항목 • 총 ${request.total_requested}개 요청`,
                requestDate: new Date(request.created_at).toLocaleDateString(),
                currentStock: request.total_supplied, // 실제 배송된 수량
                targetStock: request.total_requested, // 요청된 수량
                progress: request.supply_rate, // 실제 배송률
                status: request.supply_status, // 배송 상태 (completed, in_progress, pending)
                priority: request.priority,
                // 추가 정보
                supplyDetails: request.relief_items_with_supply
            }
        })
    }, [requestsData]);

    const handleAdd = () => {
        navigate(`/add/${currentShelterId}`);
    }

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <LoadingSpinner text="구호품 요청 목록을 불러오는 중..." />
        )
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

            <RequestCardList cnt={requests.length} data={requests} />
        </>
    )
}

export default ProductList;