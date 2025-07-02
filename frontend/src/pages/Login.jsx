import { Layout, Input, Button, Form, Space, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../styles/colors'

import { Logo } from '../components/login/Logo'

const { Content } = Layout

const Login = () => {
    const navigate = useNavigate()

    const onLogin = async (values) => {
        // const { user_id, password } = values
        try {
            // ✅ 여기에 실제 로그인 API 요청 예정 - api 폴더에 구현해서 들고오기
            // const response = await loginService.login({ username, password })
            // if (response.success) {
            //   navigate(`/home`)
            // }

            console.log('로그인 요청: ', values)
            message.success('로그인 성공 (예시)')
            navigate('/home')
        } catch (error) {
            message.error('로그인 실패: ', error);
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
                        name="user_id"
                        rules={[{ required: true, message: '아이디를 입력하세요.' }]}
                    >
                    <Input placeholder="아이디" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}
                    >
                    <Input.Password placeholder="비밀번호" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '2rem', marginBottom: 0 }}>
                        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                onClick={() => navigate('/signup')}
                            >
                                사용자 등록
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ backgroundColor: COLORS.primary }}
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