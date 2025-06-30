import { Layout, Input, Button, Form, Space, message, Upload } from 'antd'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../styles/colors'

import { Logo } from '../components/login/Logo'

const { Content } = Layout

const SignUp = () => {
    const navigate = useNavigate()

    const onSignUp = async (values) => {
        // const { user_id, password } = values
        // const user_type = 'public_officer'
        try {
            // ✅ 여기에 실제 회원가입 API 요청 예정 - api 폴더에 구현해서 들고오기?
            // const response = await loginService.login({ username, password })
            // if (response.success) {
            //   navigate(`/home`)
            // }

            console.log('회원가입 요청: ', values)
            message.success('회원가입 성공 (예시)')
            navigate('/login')
        } catch (error) {
            message.error('회원가입 실패: ', error);
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
                        >
                            <Button style={{ width: '380px' }}>전자서명인증서 선택</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item style={{ marginTop: '2rem', marginBottom: 0 }}>
                        <Space style={{ display: 'flex', justifyContent: 'center' }}>
                            
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ backgroundColor: COLORS.primary }}
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