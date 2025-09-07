import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box, BottomNavigation, BottomNavigationAction, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LogoutConfirmDialog from '../dialogs/LogoutConfirmDialog';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert'; 
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

    // 로그아웃 다이얼로그
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const handleLogoutCancel = () => setIsLogoutDialogOpen(false);
    const handleLogoutConfirm = async () => { await handleLogout(); setIsLogoutDialogOpen(false); };

    // 메뉴 상태
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => setAnchorEl(null);

    // 메뉴 동작
    const handleMenuClick = (action) => {
        handleMenuClose();
        if (action === 'logout') {
            setIsLogoutDialogOpen(true);
        } else if (action === 'address') {
            navigate('/setting/address'); // 예시: 주소 입력 페이지 이동
        }
    };

    // 네비게이션/상단바 아이템
    const navItems = [
        { label: '기부 배송', value: 'status', icon: FavoriteIcon },
        { label: 'MAIN', value: 'supply', icon: HomeIcon },
        { label: '내 정보', value: 'setting', icon: PersonIcon },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '100vw' }}>
            {/* 상단바 */}
            <AppBar position="fixed">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    {/* 왼쪽 여백 (빈 Box로 균형 맞춤) */}
                    <Box sx={{ width: 40 }} />

                    {/* 중앙 description */}
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        {description}
                    </Box>

                    {/* 오른쪽: setting 페이지일 때만 메뉴 버튼 */}
                    <Box sx={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
                        {value === 'setting' && (
                            <>
                                <IconButton color="inherit" onClick={handleMenuOpen}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={menuOpen}
                                    onClose={handleMenuClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    PaperProps={{
                                        elevation: 3, // 그림자
                                        sx: {
                                            borderRadius: 3, // 모서리 둥글게 (12px)
                                            overflow: 'hidden', // Divider 경계 맞추기
                                            mt: 1,
                                            minWidth: 160,
                                        },
                                    }}
                                >
                                    <MenuItem onClick={() => handleMenuClick('logout')}>로그아웃</MenuItem>
                                    <Divider component="li" sx={{ mx: 1, }} />
                                    <MenuItem onClick={() => handleMenuClick('address')}>내 주소 입력</MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 메인 컨텐츠 */}
            <Box sx={{ flex: 1, mt: '80px', mb: '80px', overflow: 'auto', minHeight: 0 }}>
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
