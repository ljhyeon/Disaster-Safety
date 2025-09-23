import { useNavigate } from 'react-router-dom';
import { Layout, Input, Button, Form, Space, message, Upload } from 'antd';
import { Logo } from '../components/login/Logo';
import { COLORS } from '../styles/colors';
import { signUp } from '../services/authService'
import { USER_TYPES } from '../constants/firebaseFields';
import { useLoading } from '../hooks/useLoading';

const { Content } = Layout;

const SignUp = () => {
    const navigate = useNavigate();
    const { isLoading, withLoading } = useLoading();

    const onSignUp = async (values) => {
        const { email, password, displayName, file } = values;
        
        await withLoading(async () => {
            // 공무원 인증서 파일 확인 (실제 업로드는 하지 않고 파일명만 저장)
            let certFile = null
            if (file && file.length > 0) {
                certFile = file[0].name // 파일명만 저장 (실제 업로드 없음)
            }
            
            try {
                // 공무원으로 회원가입 (user_type 고정)
                const result = await signUp(
                    email, 
                    password, 
                    displayName, 
                    USER_TYPES.PUBLIC_OFFICER, // user_type 고정
                    null, // phoneNumber
                    null, // zipcode
                    null, // roadAddress
                    null, // addressDetail
                    certFile, // certificate_file
                    null // preferredCategories
                )
                
                if (result.success) {
                    console.log('회원가입 성공:', result.user)
                    console.log('Firestore 저장 결과:', result.firestoreResult)
                    message.success('회원가입이 완료되었습니다!')
                    navigate('/login')
                } else {
                    message.error(result.error.message)
                }
            } catch (error) {
                console.error('회원가입 실패:', error)
                message.error('회원가입 중 오류가 발생했습니다.')
                throw error
            }
        })
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
                                전자서명인증서 선택 (공무원 인증용)
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