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
import MainLayout from './components/layouts/MainLayout'
import { useAuthStore } from './store/authStore'

function App() {
  const { initializeAuth, isLoading } = useAuthStore()

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
        {/* ✅ 루트 접근 시 로그인으로 이동 */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ✅ 레이아웃 없는 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="home" element={<Home />} />
        <Route path="/shelter-register" element={<ShelterRegister />} />
        
        {/* ✅ MainLayout 적용 대상 */}
        <Route path="/" element={<MainLayout />}>
          <Route path="main/:id" element={<Main />} />
          <Route path="list/:id" element={<ProductList />} />
          <Route path="add/:id" element={<AddProduct />} />
          <Route path="setting/:id" element={<Setting />} />
          <Route path="editsetting/:id" element={<EditSetting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
