import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'
import { useEffect, useState } from 'react'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Layout, Spin, message, Button, Space, Avatar, Divider } from 'antd'
import { PlusOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons'

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                minWidth: '280px'
            }}>
                <Space direction="vertical" size="medium" style={{ width: '100%' }}>
                    {/* 관리자 정보 헤더 */}
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                    }}>
                        <Avatar 
                            size={40} 
                            icon={<UserOutlined />} 
                            style={{ 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '2px solid rgba(255,255,255,0.3)'
                            }}
                        />
                        <div>
                            <div style={{ 
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '2px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                                윤주혁 주무관
                            </div>
                            <div style={{ 
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <EnvironmentOutlined style={{ fontSize: '10px' }} />
                                대구광역시 북구 안전 총괄과
                            </div>
                        </div>
                    </div>
                    
                    <Divider style={{ 
                        margin: '8px 0',
                        borderColor: 'rgba(255,255,255,0.2)'
                    }} />
                    
                    {/* 통계 정보 */}
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        marginBottom: '12px'
                    }}>
                        <div style={{ 
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '11px',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            등록된 대피소
                        </div>
                        <div style={{ 
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            {shelters.length}개
                        </div>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <Button 
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/shelter-register')}
                        style={{
                            width: '100%',
                            height: '44px',
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#667eea',
                            fontWeight: '600',
                            fontSize: '14px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'white'
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.9)'
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        대피소 등록
                    </Button>
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