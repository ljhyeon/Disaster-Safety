// components/layouts/MainLayout.jsx
import { Layout, Menu, Button, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DashboardOutlined, WarningOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useShelterStore } from '../../store/useShelterStore'
import { COLORS } from '../../styles/colors'

const { Title, Text } = Typography

const { Header, Sider, Content } = Layout

export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const selectedId = useShelterStore((s)=>s.selectedId)
    const name = useShelterStore((s)=>s.name)
    const setName = useShelterStore((s)=>s.setName)

    const selectedKey = location.pathname.split('/')[1] || 'home'

    const handleMenuClick = ({ key }) => {
        if (!selectedId) {
            // alert('ID가 선택되지 않았습니다. 먼저 Home에서 선택해주세요.')
            navigate('/home')
            return
        }
        navigate(`/${key}/${selectedId}`)
    }

    const handleLogout = () => {
        navigate('/login')
    }

    return (
        <Layout style={{ height: '100vh', width: '100vw' }}>
            <Sider 
                breakpoint="lg" 
                collapsedWidth="80" 
                style={{ 
                    background: '#001529',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    height: '100vh',
                    zIndex: 1000
                }}
            >
                <div
                    className="logo"
                    style={{ height: 32, margin: 16, color: COLORS.gray2, fontSize: '24px', textAlign: 'center', cursor: 'pointer', }}
                    onClick={()=>{
                        navigate('/home')
                        setName('')
                    }}
                >
                    이어드림
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    items={[
                        {
                            key: 'main',
                            icon: <DashboardOutlined />,
                            label: 'Main',
                        },
                        {
                            key: 'list',
                            icon: <WarningOutlined />,
                            label: '필요 구호품 등록',
                        },
                        {
                            key: 'setting',
                            icon: <UserOutlined />,
                            label: '설정',
                        }
                    ]}
                />
                {/* ✅ 하단 로그아웃 버튼 */}
                <div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    width: '100%',
                    textAlign: 'center',
                }}
                >
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        style={{ color: COLORS.gray2 }}
                        onClick={handleLogout}
                    >
                        로그아웃
                    </Button>
                </div>
            </Sider>
            <Layout style={{ marginLeft: 200 }}>
                <Header style={{ background: '#fff', padding: 0, fontSize: '24px', paddingLeft: '20px' }}>
                    <Title level={2} style={{ color: COLORS.gray7 }}>
                        {name}
                    </Title>
                </Header>
                <Content style={{ margin: '0', overflow: 'initial' }}>
                    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}
