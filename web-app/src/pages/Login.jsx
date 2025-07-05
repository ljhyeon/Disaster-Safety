import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from '@mui/material';

import { Logo } from '../components/Logo';
import { signIn } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { setUser } = useAuthStore();

    const handleLogin = async () => {
        // 입력값 검증
        if (!email || !password) {
            setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('올바른 이메일 형식을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const result = await signIn(email, password);
            
            if (result.success) {
                setUser(result.user);
                console.log('로그인 성공:', result.user);
            navigate('/home');
            } else {
                setErrorMessage(result.error.message);
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            setErrorMessage('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2,
                boxSizing: 'border-box',
            }}
        >
            <Logo />

            <Box width="85%" my={2}>
                <TextField
                    fullWidth
                    label="이메일"
                    type="email"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={Boolean(errorMessage && !email)}
                    disabled={isLoading}
                />
                <TextField
                    fullWidth
                    label="비밀번호"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={Boolean(errorMessage && !password)}
                    disabled={isLoading}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleLogin();
                        }
                    }}
                />

                {errorMessage && (
                    <Typography variant="body2" color="error" mt={1}>
                        {errorMessage}
                    </Typography>
                )}

                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/signup')}
                        sx={{ mr: 1 }}
                        disabled={isLoading}
                    >
                        사용자 등록
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        sx={{ ml: 1 }}
                        disabled={isLoading}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}