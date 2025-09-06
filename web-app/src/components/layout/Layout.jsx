import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box, BottomNavigation, BottomNavigationAction, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LogoutConfirmDialog from '../dialogs/LogoutConfirmDialog';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useAuth } from '../../hooks/useAuth';

export function Layout({ description, children }) {
    const { handleLogout } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // 경로에 따라 value 결정
    const getValueFromPath = (pathname) => {
        if (pathname.startsWith('/supply')) return 'supply';
        if (pathname.startsWith('/status')) return 'status';
        if (pathname.startsWith('/setting')) return 'setting';
        return 'supply';
    };
    const [value, setValue] = useState(getValueFromPath(location.pathname));
    useEffect(() => { setValue(getValueFromPath(location.pathname)); }, [location.pathname]);

    // 네비게이션 변경 핸들러
    const handleChange = (event, newValue) => {
        setValue(newValue);
        switch (newValue) {
            case 'supply': navigate('/supply'); break;
            case 'status': navigate('/status'); break;
            case 'setting': navigate('/setting'); break;
            default: break;
        }
    };

    // 네비게이션/상단바 아이템
    const navItems = [
        { label: '기부 배송', value: 'status', icon: LocalShippingIcon },
        { label: 'MAIN', value: 'supply', icon: HomeIcon },
        { label: '내 정보', value: 'setting', icon: PersonIcon },
    ];
    const appBarItems = [
        { value: 'status', src: '/status.svg' },
        { value: 'supply', src: '/supply.svg' },
        { value: 'setting', src: '/setting.svg' },
    ];
    const currentIconSrc = (appBarItems.find(item => item.value === value) || {}).src || '/supply.svg';

    // 로그아웃 다이얼로그
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const handleLogoutCancel = () => setIsLogoutDialogOpen(false);
    const handleLogoutConfirm = async () => { await handleLogout(); setIsLogoutDialogOpen(false); };
    const handleLogoClick = () => setIsLogoutDialogOpen(true);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '100vw' }}>
            {/* 상단바 */}
            <AppBar position="fixed">
                <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '100px !important', px: 2 }}>
                    <IconButton edge="start" onClick={() => navigate('/supply')} sx={{ '&:hover': { backgroundColor: 'transparent' } }}>
                        <ArrowBackIosNewRoundedIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <IconButton disableRipple sx={{ p: 0, '&:hover': { backgroundColor: 'transparent', transform: 'scale(1.05)' }, transition: 'transform 0.2s ease-in-out' }} onClick={handleLogoClick}>
                            <img src={currentIconSrc} alt="current page icon" />
                        </IconButton>
                        <Box sx={{ mt: 1, height: '16px' }}>{description}</Box>
                    </Box>
                    <Box sx={{ width: 40 }} />
                </Toolbar>
            </AppBar>

            {/* 메인 컨텐츠 */}
            <Box sx={{ flex: 1, marginTop: '102px', marginBottom: '80px', overflow: 'auto', minHeight: 0 }}>
                {children}
            </Box>
            
            {/* 하단 네비게이션 */}
            <BottomNavigation sx={{ width: '100%', position: 'fixed', bottom: 0, borderTop: 1, borderColor: 'divider', height: '80px' }} value={value} onChange={handleChange} showLabels>
                {navItems.map(({ label, value: itemValue, icon: Icon }) => {
                    const selected = value === itemValue;
                    const iconColor = selected ? theme.palette.secondary.main : theme.palette.primary.light;
                    return (
                        <BottomNavigationAction key={itemValue} label={label} value={itemValue} icon={<Icon selected={selected} color={iconColor} />} />
                    );
                })}
            </BottomNavigation>

            <LogoutConfirmDialog open={isLogoutDialogOpen} onClose={handleLogoutCancel} onConfirm={handleLogoutConfirm} />
        </Box>
    );
}
