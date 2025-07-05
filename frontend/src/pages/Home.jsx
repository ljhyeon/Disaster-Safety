import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'
import { useEffect, useState } from 'react'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Layout, Spin, message, Button, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import { getAllShelters } from '../services/shelterService'

const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.freepik.com/512/7294/7294032.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
})

const Home = () => {
    const navigate = useNavigate()
    const setSelectedId = useShelterStore((s)=>s.setSelectedId)
    const setName = useShelterStore((s)=>s.setName)
    const [shelters, setShelters] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Firestore에서 대피소 데이터 가져오기
    useEffect(() => {
        const fetchShelters = async () => {
            try {
                const result = await getAllShelters()
                if (result.success) {
                    setShelters(result.shelters)
                } else {
                    message.error('대피소 정보를 불러올 수 없습니다.')
                    console.error('대피소 조회 실패:', result.error)
                }
            } catch (error) {
                message.error('대피소 정보를 불러오는 중 오류가 발생했습니다.')
                console.error('대피소 조회 오류:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchShelters()
    }, [])

    const handleSelectId = (shelterId, name) => {
        setSelectedId(shelterId)
        setName(name)
        navigate(`/main/${shelterId}`)
    }

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <Layout style={{ minHeight: '100vh', width: '100vw', backgroundColor: "white" }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <Spin size="large" />
                    <div>대피소 정보를 불러오는 중...</div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', backgroundColor: "white" }}>
            {/* 상단 컨트롤 바 */}
            <div style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                zIndex: 1000,
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
                <Space>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/shelter-register')}
                    >
                        대피소 등록
                    </Button>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        총 {shelters.length}개 대피소
                    </div>
                </Space>
            </div>

            <MapContainer
                center={[35.8714, 128.6014]} // 대구 중심으로 변경
                zoom={13}
                style={{ height: '100vh', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {shelters.map((shelter) => (
                    <Marker 
                        key={shelter.shelter_id} 
                        position={[shelter.latitude, shelter.longitude]} 
                        icon={customIcon}
                    >
                        <Popup>
                        <div style={{ textAlign: 'center' }}>
                                <strong>{shelter.shelter_name}</strong><br />
                                <div style={{ margin: '8px 0', fontSize: '12px', color: '#666' }}>
                                    재난유형: {shelter.disaster_type}<br />
                                    수용률: {shelter.occupancy_rate}% ({shelter.current_occupancy}/{shelter.capacity}명)<br />
                                    상태: <span style={{ 
                                        color: shelter.status === '운영중' ? '#52c41a' : 
                                              shelter.status === '포화' ? '#ff4d4f' : '#faad14'
                                    }}>
                                        {shelter.status}
                                    </span>
                                </div>
                            <button
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '4px 8px',
                                    backgroundColor: '#1677ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                                    onClick={() => handleSelectId(shelter.shelter_id, shelter.shelter_name)}
                            >
                                상세보기 →
                            </button>
                        </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Layout>
    )
}

export default Home;