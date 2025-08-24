import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup, } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Box, Typography, Button, IconButton, CircularProgress, Alert } from '@mui/material';
import { getAllShelters } from '../services/shelterService';
import { testFirebaseConnection } from '../services/reliefService';

import LogoutConfirmDialog from '../components/LogoutConfirmDialog';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { useShelterStore } from '../store/shelterStore';

// import TutorialHome from '../components/tutorials/home';
import Tutorial from '../components/tutorials/tutorial';
import { useAuth } from '../hooks/useAuth';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.freepik.com/512/7294/7294032.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// 대구시민회관 전용 특별 아이콘 (빨간색, 더 크게, 높은 z-index)
const specialIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.freepik.com/512/684/684908.png', // 빨간색 마커
  iconSize: [42, 42], // 더 큰 크기
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
  zIndexOffset: 9999, // 최대 z-index
});

export function Home() {
    const navigate = useNavigate();
    const { setShelterInfo } = useShelterStore(); // 업데이트된 store 사용
    const { handleLogout } = useAuth();

    // 대피소 데이터 상태
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [tutorialOpen, setTutorialOpen] = useState(true);

    // 대피소 데이터 로드
    useEffect(() => {
        // Firebase 연결 테스트 먼저 실행
        testFirebaseConnection().then(() => {
            loadShelters();
        });
    }, []);

    const loadShelters = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('🏠 Home.jsx에서 대피소 데이터 로드 시작...');
            
            // 타임아웃 설정 (10초)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('요청 시간 초과')), 10000)
            );
            
            const result = await Promise.race([
                getAllShelters(),
                timeoutPromise
            ]);
            
            console.log('🏠 Home.jsx 결과:', result);
            
            if (result.success) {
                setShelters(result.shelters);
                console.log('✅ 대피소 데이터 설정 완료:', result.shelters.length, '개');
            } else {
                setError(result.error?.message || '대피소 데이터를 불러올 수 없습니다.');
            }
        } catch (err) {
            console.error('❌ 대피소 데이터 로드 실패:', err);
            setError('대피소 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectId = (id, name, address) => {
        setShelterInfo(id, name, address); // id, name, address 모두 저장
        navigate(`/supply/${id}`);
    };

    // 로그아웃 모달 상태
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    // 로그아웃 취소 핸들러
    const handleLogoutCancel = () => {
        setIsLogoutDialogOpen(false);
    };

    // 로그아웃 확인 핸들러
    const handleLogoutConfirm = async () => {
        await handleLogout();
        setIsLogoutDialogOpen(false);
    };

    // 로고 클릭 핸들러
    const handleLogoClick = () => {
        setIsLogoutDialogOpen(true);
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
            }}
        >

            <Box 
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                }}
            >
                {/* 좌측 공간을 차지해서 중앙 정렬 유지를 위해 추가 */}
                <Box sx={{ width: 40 }} />

                <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                    대피소 현황 지도
                </Typography>
                <IconButton
                    edge="start"
                    onClick={handleLogoClick}
                    sx={{
                        '&:hover': { backgroundColor: 'transparent' },
                        mt: 2,
                    }}
                >
                    <LogoutOutlinedIcon />
                </IconButton>
            </Box>

            <Box sx={{ flex: 1, mt: 1 }}>
                {loading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <CircularProgress />
                        <Typography>대피소 정보를 불러오는 중...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        flexDirection: 'column',
                        gap: 2,
                        px: 2
                    }}>
                        <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
                            {error}
                        </Alert>
                        <Button variant="outlined" onClick={loadShelters}>
                            다시 시도
                        </Button>
                    </Box>
                ) : (
                    <MapContainer
                        center={[35.8714, 128.6014]} // 대구 중심 좌표
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                    >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    {shelters.map((shelter, idx) => {
                        // 대구시민회관인지 확인
                        const isDaeguCitizenHall = shelter.shelter_name && shelter.shelter_name.includes('대구시민회관');
                        
                        return (
                        <Marker
                            key={shelter.id || idx}
                            position={shelter.position}
                            icon={isDaeguCitizenHall ? specialIcon : customIcon}
                        >
                            <Popup>
                                <Box textAlign="center">
                                    <Typography fontWeight="bold" fontSize={14}>
                                        {shelter.shelter_name}
                                    </Typography>
                                    <Typography fontSize={12} sx={{ mb: 1 }}>
                                        {shelter.location}
                                    </Typography>
                                    <Typography fontSize={11} color="text.secondary" sx={{ mb: 1 }}>
                                        {shelter.disaster_type} • {shelter.status}
                                    </Typography>
                                    <Typography fontSize={11} color="text.secondary" sx={{ mb: 1 }}>
                                        수용: {shelter.current_occupancy}/{shelter.capacity}명 ({shelter.occupancy_rate}%)
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{ mt: 1, fontSize: 12 }}
                                        onClick={() => handleSelectId(shelter.shelter_id, shelter.shelter_name, shelter.location)}
                                    >
                                        상세보기 →
                                    </Button>
                                </Box>
                            </Popup>
                        </Marker>
                        );
                    })}
                    </MapContainer>
                )}
            </Box>

            <LogoutConfirmDialog
                open={isLogoutDialogOpen}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
            />

            <Tutorial
                open={tutorialOpen}
                onClose={() => setTutorialOpen(false)} 
            />
        </Box>
    )
}