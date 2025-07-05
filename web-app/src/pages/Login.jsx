import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from '@mui/material';

import { Logo } from '../components/Logo';

export function Login() {
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        // 입력값 검증
        if (!id || !password) {
            setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            console.log('로그인 성공:', { id, password });
            // 실제 로그인 API 호출 코드 (axios 등) 추가 예정
            navigate('/home');
        } catch (error) {
            console.error('로그인 실패:', error);
            setErrorMessage('로그인 실패. 다시 시도하세요.');
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
                    label="아이디"
                    variant="outlined"
                    margin="normal"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    error={Boolean(errorMessage && !id)}
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
                    >
                        사용자 등록
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        sx={{ ml: 1 }}
                    >
                        로그인
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}