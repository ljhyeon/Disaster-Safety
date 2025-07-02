import { Container, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Layout } from './components/layout/Layout';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Home } from './pages/Home';
import { Status } from './pages/Status';
import { Supply } from './pages/Supply';
import { Setting } from './pages/Setting';
import theme from './theme';

// Layout이 필요없는 페이지들
const noLayoutPages = ['/login', '/signup', '/home'];

// 페이지별 description 정의
const pageDescriptions = {
  '/supply': (
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'white', 
        fontWeight: 500,
        textAlign: 'center',
        flex: 1
      }}
    >
      각 대피소에서 필요로 하는 구호품이에요
    </Typography>
  ),
  '/status': (
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'white', 
        fontWeight: 500,
        textAlign: 'center',
        flex: 1
      }}
    >
      내가 보내기로 한 구호품이에요
    </Typography>
  ),
  '/setting': (
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'white', 
        fontWeight: 500,
        textAlign: 'center',
        flex: 1
      }}
    >
      입력한 정보에 따라 적절한 기부처를 추천해드려요
    </Typography>
  ),
};

function AppContent() {
  const location = useLocation();
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);

  const content = (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/supply/:id" element={<Supply />} />
      <Route path="/status/:id" element={<Status />} />
      <Route path="/setting/:id" element={<Setting />} />
    </Routes>
  );

  // Layout에서 사용할 때
  const getDescriptionKey = (pathname) => {
    if (pathname.startsWith('/supply')) return '/supply';
    if (pathname.startsWith('/status')) return '/status';
    if (pathname.startsWith('/setting')) return '/setting';
    return '/supply';
  };

  if (shouldShowLayout) {
    return (
      <Layout description={pageDescriptions[getDescriptionKey(location.pathname)]}>
        <Container disableGutters sx={{height: '100%'}}>
          {content}
        </Container>
      </Layout>
    );
  }

  return content;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;