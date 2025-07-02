import { useState, useEffect, } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box, BottomNavigation, BottomNavigationAction, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

export function Layout({ description, children }) {
    const theme = useTheme();

    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

     // 현재 경로에서 ID 추출
    const currentId = params.id;

     // 현재 경로에 맞춰 value 상태 초기화 (ID 제외한 경로 기준)
    const getValueFromPath = (pathname) => {
        if (pathname.startsWith('/supply')) return 'supply';
        if (pathname.startsWith('/status')) return 'status';
        if (pathname.startsWith('/setting')) return 'setting';
        return 'supply';
    };

    const [value, setValue] = useState(getValueFromPath(location.pathname));

    // 경로가 변경될 때마다 value 업데이트
    useEffect(() => {
        const currentValue = getValueFromPath(location.pathname);
        setValue(currentValue);
    }, [location.pathname]);


    const handleChange = (event, newValue) => {
        setValue(newValue);

        // value에 따라 경로로 이동
        switch (newValue) {
        case 'supply':
            navigate(`/supply/${currentId}`);
            break;
        case 'status':
            navigate(`/status/${currentId}`);
            break;
        case 'setting':
            navigate(`/setting/${currentId}`);
            break;
        default:
            break;
        }
    };


    const navItems = [
        {
            label: '기부 배송',
            value: 'status',
            icon: LocalShippingIcon,
        },
        {
            label: 'MAIN',
            value: 'supply',
            icon: HomeIcon,
        },
        {
            label: '내 정보',
            value: 'setting',
            icon: PersonIcon,
        },
    ];

    const appBarItems = [
        { value: 'status', src: '/status.svg', },
        { value: 'supply', src: '/supply.svg', },
        { value: 'setting', src: '/setting.svg', },
    ];

    // 현재 value에 맞는 상단바 아이콘 찾기
    const currentAppBarItem = appBarItems.find(item => item.value === value);
    const currentIconSrc = currentAppBarItem ? currentAppBarItem.src : '/supply.svg'; // 기본값

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '100vw' }}>
            {/* 상단바 영역 - 고정 위치 */}
            <AppBar position="fixed">
                <Toolbar 
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '100px !important',
                        px: 2,
                    }}
                >
                    <IconButton
                        edge="start"
                        onClick={() => navigate('/home')}
                        sx={{
                            '&:hover': { backgroundColor: 'transparent' },
                        }}
                        >
                        <ArrowBackIosNewRoundedIcon sx={{ color: 'white' }} />
                    </IconButton>

                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <IconButton
                            disableRipple
                            sx={{
                            p: 0,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                transform: 'scale(1.05)',
                            },
                            transition: 'transform 0.2s ease-in-out',
                            }}
                        >
                            <img src={currentIconSrc} alt="current page icon" />
                        </IconButton>
                        <Box sx={{ mt: 1, height: '16px' }}>{description}</Box>
                    </Box>

                    {/* 우측 공간을 차지해서 중앙 정렬 유지를 위해 추가 */}
                    <Box sx={{ width: 40 }} />
                </Toolbar>
            </AppBar>

            {/* 메인 컨텐츠 영역 */}
            <Box sx={{ 
                flex: 1, // 남은 공간을 모두 차지
                marginTop: '102px', // 상단바 높이만큼 마진
                marginBottom: '80px', // 하단 네비게이션 높이만큼 마진
                overflow: 'auto', // 스크롤 가능
                minHeight: 0, // flexbox에서 overflow 작동을 위해 필요
            }}>
                {children}
            </Box>
            
            {/* 하단 네비게이션 - 고정 위치 */}
            <BottomNavigation
            sx={{
                width: '100%',
                position: 'fixed',
                bottom: 0,
                borderTop: 1,
                borderColor: 'divider',
                height: '80px',
            }}
            value={value}
            onChange={handleChange}
            showLabels
            >
            {navItems.map(({ label, value: itemValue, icon: Icon }) => {
                const selected = value === itemValue;
                const iconColor = selected
                ? theme.palette.secondary.main
                : theme.palette.primary.light;

                return (
                <BottomNavigationAction
                    key={itemValue}
                    label={label}
                    value={itemValue}
                    icon={<Icon selected={selected} color={iconColor} />}
                />
                );
            })}
            </BottomNavigation>
        </Box>
    )
}