import { useNavigate, useParams } from 'react-router-dom'
import { Button, Typography, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react'

import { useShelterStore } from '../store/useShelterStore'
import { RequestCardList } from '../components/RequestCardList'

const { Title, } = Typography

import { getReliefRequestsWithSupplyStatus } from '../services/reliefService';

const ProductList = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const selectedId = useShelterStore((s)=>s.selectedId)
    const setSelectedId = useShelterStore((s)=>s.setSelectedId)
    const [requests, setRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // URL 파라미터의 id를 store에 설정
    useEffect(() => {
        if (id && id !== selectedId) {
            setSelectedId(id)
        }
    }, [id, selectedId, setSelectedId])

    // 구호품 요청 목록 로드
    useEffect(() => {
        const loadRequests = async () => {
            const currentShelterId = selectedId || id
            
            if (!currentShelterId) {
                message.error('대피소가 선택되지 않았습니다.')
                navigate('/home')
                return
            }

            try {
                const result = await getReliefRequestsWithSupplyStatus(currentShelterId)
                
                if (result.success) {
                    // 배송 현황이 포함된 데이터를 RequestCard 형태로 변환
                    const transformedData = result.requests.map((request, index) => {
                        // 구호품 목록을 문자열로 변환
                        const itemNames = request.relief_items.map(item => item.item).join(', ')
                        
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
                    setRequests(transformedData)
                } else {
                    message.error('구호품 요청 목록을 불러올 수 없습니다.')
                    setRequests([])
                }
            } catch (error) {
                message.error('구호품 요청 목록을 불러오는 중 오류가 발생했습니다.')
                setRequests([])
            } finally {
                setIsLoading(false)
            }
        }

        if (selectedId || id) {
            loadRequests()
        }
    }, [selectedId, id, navigate])

    const handleAdd = () => {
        const currentShelterId = selectedId || id
        navigate(`/add/${currentShelterId}`)
    }

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <div>구호품 요청 목록을 불러오는 중...</div>
            </div>
        )
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