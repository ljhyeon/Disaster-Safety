import { Container, Typography, CircularProgress, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Layout } from './components/layout/Layout';
import { useLocation } from 'react-router-dom';
import theme from './theme';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { AppRoutes } from './pages/routes';

// Layout이 필요없는 페이지들
const noLayoutPages = ['/login', '/signup'];

// 페이지별 description 정의
const pageDescriptions = {
  '/supply': <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, textAlign: 'center', flex: 1 }}>구호품 매칭 결과</Typography>,
  '/status': <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, textAlign: 'center', flex: 1 }}>내가 보낸 구호품</Typography>,
  '/setting': <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, textAlign: 'center', flex: 1 }}>내 정보</Typography>,
};

function AppContent() {
  const location = useLocation();
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);

  const getDescriptionKey = (pathname) => {
    if (pathname.startsWith('/supply')) return '/supply';
    if (pathname.startsWith('/status')) return '/status';
    if (pathname.startsWith('/setting')) return '/setting';
    return '/supply'; // 기본값
  };

  if (shouldShowLayout) {
    return (
      <Layout description={pageDescriptions[getDescriptionKey(location.pathname)]}>
        <Container disableGutters sx={{ height: '100%' }}>
          <AppRoutes />
        </Container>
      </Layout>
    );
  }
  return <AppRoutes />;
}

function App() {
  const { initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', flexDirection: 'column', gap: 2 }}>
          <CircularProgress />
          <Typography>로딩 중...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
