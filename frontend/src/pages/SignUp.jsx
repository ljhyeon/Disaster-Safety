import { Layout, Input, Button, Form, Space, message, Upload } from 'antd'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../styles/colors'

import { Logo } from '../components/login/Logo'
import { signUp } from '../services/authService'
import { useState } from 'react'

const { Content } = Layout

const SignUp = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const onSignUp = async (values) => {
        const { email, password, displayName } = values
        
        setIsLoading(true)
        
        try {
            const result = await signUp(email, password, displayName)
            
            if (result.success) {
                console.log('회원가입 성공:', result.user)
                message.success('회원가입이 완료되었습니다!')
                navigate('/login')
            } else {
                message.error(result.error.message)
            }
        } catch (error) {
            console.error('회원가입 실패:', error)
            message.error('회원가입 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', backgroundColor: "white" }}>
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
                    onFinish={onSignUp}
                    autoComplete="off"
                    style={{ width: '380px' }}
                >
                    <Form.Item
                        name="displayName"
                        rules={[{ required: true, message: '이름을 입력하세요.' }]}
                    >
                        <Input placeholder="이름" disabled={isLoading} />
                    </Form.Item>

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
                        rules={[
                            { required: true, message: '비밀번호를 입력하세요.' },
                            { min: 6, message: '비밀번호는 6자 이상이어야 합니다.' }
                        ]}
                    >
                        <Input.Password placeholder="비밀번호 (6자 이상)" disabled={isLoading} />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: '비밀번호를 다시 입력하세요.' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="비밀번호 확인" disabled={isLoading} />
                    </Form.Item>

                    <Form.Item
                        name="file"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                        rules={[{ required: true, message: '전자서명인증서를 첨부해주세요.' }]}
                    >
                        <Upload
                            name="file"
                            beforeUpload={() => false} // 업로드를 수동으로 처리할 경우 false 설정
                            multiple={false}
                            maxCount={1}
                            disabled={isLoading}
                        >
                            <Button style={{ width: '380px' }} disabled={isLoading}>
                                전자서명인증서 선택
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item style={{ marginTop: '2rem', marginBottom: 0 }}>
                        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                onClick={() => navigate('/login')}
                                disabled={isLoading}
                            >
                                로그인으로 이동
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ backgroundColor: COLORS.primary }}
                                loading={isLoading}
                            >
                                사용자 등록
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Content>
        </Layout>
    )
}

export default SignUp;