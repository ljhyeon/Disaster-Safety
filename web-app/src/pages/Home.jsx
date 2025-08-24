import { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, CircularProgress, Alert } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Tutorial from '../components/tutorials/tutorial';
import { LoadingState } from '../components/common/LoadingState';
import { customIcon, specialIcon } from '../components/map/MapIcons';
import { MapView } from '../components/map/MapView';
import LogoutConfirmDialog from '../components/dialog/LogoutConfirmDialog';
import { useShelterStore } from '../store/shelterStore';
import { useAuth } from '../hooks/useAuth';
import { useShelters } from '../hooks/useShelters';
import 'leaflet/dist/leaflet.css';

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
                    <MapView 
                        shelters={shelters} 
                        onShelterSelect={handleSelectId} 
                        customIcon={customIcon}
                        specialIcon={specialIcon}
                    />
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