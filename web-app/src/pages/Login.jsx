import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from '@mui/material';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { isLoading, errorMessage, handleSignIn, } = useAuth();

    const onSubmit = () => handleSignIn(email, password);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSubmit();
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
                    onKeyPress={handleKeyPress}
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
                        onClick={onSubmit}
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