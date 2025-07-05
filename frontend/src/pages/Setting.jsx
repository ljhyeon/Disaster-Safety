import { Button, Typography, Descriptions, Divider, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'
import { useEffect, useState } from 'react'

const { Title, } = Typography

import { getShelter } from '../services/shelterService';

const Setting = () => {
    const navigate = useNavigate()
    const selectedId = useShelterStore((s)=>s.selectedId)
    const [shelter, setShelter] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // 대피소 정보 로드
    useEffect(() => {
        const loadShelterData = async () => {
            if (!selectedId) {
                message.error('대피소가 선택되지 않았습니다.')
                navigate('/home')
                return
            }

            try {
                const result = await getShelter(selectedId)
                if (result.success) {
                    setShelter(result.shelter)
                } else {
                    message.error('대피소 정보를 불러올 수 없습니다.')
                    navigate('/home')
                }
            } catch (error) {
                message.error('대피소 정보를 불러오는 중 오류가 발생했습니다.')
                console.error('대피소 조회 오류:', error)
                navigate('/home')
            } finally {
                setIsLoading(false)
            }
        }

        loadShelterData()
    }, [selectedId, navigate])

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
                <div>대피소 정보를 불러오는 중...</div>
            </div>
        )
    }

    if (!shelter) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Title level={3}>대피소 정보를 찾을 수 없습니다.</Title>
                <Button onClick={() => navigate('/home')}>홈으로 돌아가기</Button>
            </div>
        )
    }

    return (
        <>
            <Title level={1}>
                대피소 정보
            </Title>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={()=>{navigate(`/editsetting/${selectedId}`)}}>정보 수정</Button>
            </div>

            <Descriptions column={3} layout="horizontal" bordered={false}>
                <Descriptions.Item label="대피소명" span={3}>
                    {shelter.shelter_name}
                </Descriptions.Item>

                <Descriptions.Item label="대피소 ID">{shelter.shelter_id}</Descriptions.Item>
                <Descriptions.Item label="담당자 성명">{shelter.contact_person}</Descriptions.Item>
                <Descriptions.Item label="발생 재난 유형">{shelter.disaster_type}</Descriptions.Item>

                <Descriptions.Item label="대피소 주소" span={2}>{shelter.location}</Descriptions.Item>
                <Descriptions.Item label="담당자 연락처">{shelter.contact_phone}</Descriptions.Item>

                <Descriptions.Item label="위도">{shelter.latitude}</Descriptions.Item>
                <Descriptions.Item label="경도">{shelter.longitude}</Descriptions.Item>
                <Descriptions.Item label="운영 상태">
                    <span style={{ 
                        color: shelter.status === '운영중' ? '#52c41a' : 
                              shelter.status === '포화' ? '#ff4d4f' : '#faad14'
                    }}>
                        {shelter.status}
                    </span>
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions column={3} layout="horizontal" bordered={false}>
                <Descriptions.Item label="수용 가능 인원수">{shelter.capacity}명</Descriptions.Item>
                <Descriptions.Item label="장애인 편의시설 여부">{shelter.has_disabled_facility ? '여' : '부'}</Descriptions.Item>
                <Descriptions.Item label="수용률">{shelter.occupancy_rate}%</Descriptions.Item>

                <Descriptions.Item label="현재 대피 인원 수">{shelter.current_occupancy}명</Descriptions.Item>
                <Descriptions.Item label="반려동물 수용 가능 여부">{shelter.has_pet_zone ? '여' : '부'}</Descriptions.Item>
                <Descriptions.Item label="등록일">{new Date(shelter.created_at).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
        </>
    )
}

export default Setting;