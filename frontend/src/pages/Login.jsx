import { Layout, Input, Button, Form, Space, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../styles/colors'

import { Logo } from '../components/login/Logo'
import { signIn } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'

const { Content } = Layout

const Login = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const { setUser } = useAuthStore()

    const onLogin = async (values) => {
        const { email, password } = values
        
        setIsLoading(true)
        
        try {
            const result = await signIn(email, password)
            
            if (result.success) {
                setUser(result.user)
                console.log('로그인 성공:', result.user)
                message.success('로그인 성공!')
            navigate('/home')
            } else {
                message.error(result.error.message)
            }
        } catch (error) {
            console.error('로그인 실패:', error)
            message.error('로그인 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', backgroundColor: "white"}}>
            <Content
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                }}
            >
                <Logo />

                <Form
                    layout="vertical"
                    onFinish={onLogin}
                    autoComplete="off"
                    style={{ width: '380px' }}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: '이메일을 입력하세요.' },
                            { type: 'email', message: '올바른 이메일 형식을 입력하세요.' }
                        ]}
                    >
                        <Input placeholder="이메일" disabled={isLoading} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}
                    >
                        <Input.Password placeholder="비밀번호" disabled={isLoading} />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '2rem', marginBottom: 0 }}>
                        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                onClick={() => navigate('/signup')}
                                disabled={isLoading}
                            >
                                사용자 등록
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ backgroundColor: COLORS.primary }}
                                loading={isLoading}
                            >
                                로그인
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Content>
        </Layout>
    )
}

export default Login;