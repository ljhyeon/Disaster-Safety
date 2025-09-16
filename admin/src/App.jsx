import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from 'antd'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Main from './pages/Main'
import ProductList from './pages/ProductList'
import AddProduct from './pages/AddProduct'
import Setting from './pages/Setting'
import EditSetting from './pages/EditSetting'
import ShelterRegister from './pages/ShelterRegister'
import Manage from './pages/Manage'
import Check from './pages/Check'
import MainLayout from './components/layouts/MainLayout'
import { useAuthStore } from './store/authStore'

function App() {
  const { initializeAuth, isLoading, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Firebase 인증 상태 초기화
    const unsubscribe = initializeAuth()
    
    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [initializeAuth])

  // 인증 게이트 컴포넌트
  const PrivateRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/home" replace />
    }
    return children
  }

  // 인증 상태 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <div>로딩 중...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 루트 접근 시 인증 상태에 따라 분기 */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />

        {/* 레이아웃 없는 공개 페이지 (로그인/회원가입) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

        {/* 보호된 독립 페이지 */}
        <Route path="home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/shelter-register" element={<PrivateRoute><ShelterRegister /></PrivateRoute>} />

        {/* 보호된 레이아웃 및 하위 라우트 */}
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="main/:id" element={<Main />} />
          <Route path="list/:id" element={<ProductList />} />
          <Route path="add/:id" element={<AddProduct />} />
          <Route path="setting/:id" element={<Setting />} />
          <Route path="editsetting/:id" element={<EditSetting />} />
          <Route path="manage/:id" element={<Manage />} />
          <Route path="check/:id" element={<Check />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
