import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'

import { Layout, } from 'antd'

const Home = () => {
    const navigate = useNavigate()
    const setSelectedId = useShelterStore((s)=>s.setSelectedId)
    const setName = useShelterStore((s)=>s.setName)

    const handleSelectId = (id, name) => {
        setSelectedId(id)
        setName(name)
        navigate(`/main/${id}`) // 원하는 페이지로 이동 가능
    }

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            Home 페이지
            <button onClick={() => handleSelectId('1', '대구광역시 북구 대학로 대피소')}>ID 1</button>
            <button onClick={() => handleSelectId('2', '대구광역시 중구 경상감영길 대피소')}>ID 2</button>
        </Layout>
    )
}

export default Home;