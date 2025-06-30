import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Main from './pages/Main'
import ProjectList from './pages/ProductList'
import AddProduct from './pages/AddProduct'
import Setting from './pages/Setting'
import EditSetting from './pages/EditSetting'
import MainLayout from './components/layouts/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ 루트 접근 시 로그인으로 이동 */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ✅ 레이아웃 없는 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="home" element={<Home />} />
        
        {/* ✅ MainLayout 적용 대상 */}
        <Route path="/" element={<MainLayout />}>
          <Route path="main/:id" element={<Main />} />
          <Route path="list/:id" element={<ProjectList />} />
          <Route path="add/:id" element={<AddProduct />} />
          <Route path="setting/:id" element={<Setting />} />
          <Route path="editsetting/:id" element={<EditSetting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
