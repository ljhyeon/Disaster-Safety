import { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, CircularProgress, Alert } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Tutorial from '../components/tutorials/tutorial';
import { LoadingState } from '../components/common/LoadingState';
import LogoutConfirmDialog from '../components/LogoutConfirmDialog';
import { useShelterStore } from '../store/shelterStore';
import { useAuth } from '../hooks/useAuth';
import { useShelters } from '../hooks/useShelters';

import { MapContainer, TileLayer, Marker, Popup, } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

    const { shelters, loading, error, loadShelters } = useShelters();

    const [tutorialOpen, setTutorialOpen] = useState(true);
    // 로그아웃 모달 상태
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const handleSelectId = (id, name, address) => {
        setShelterInfo(id, name, address); // id, name, address 모두 저장
        navigate(`/supply/${id}`);
    };

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

    if (loading) return <LoadingState message="대피소 정보를 불러오는 중..." />;

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