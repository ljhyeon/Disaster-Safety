import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from '@mui/material';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { isLoading, fieldErrors, handleSignIn } = useAuth();

    const onSubmit = () => handleSignIn(email, password);
    const handleKeyPress = (e) => { if (e.key === 'Enter') onSubmit(); };

    return (
        <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px: 2, boxSizing: 'border-box' }}>
            <Logo />
            <Box width="85%" my={2}>
                <TextField
                    fullWidth
                    label="아이디"
                    type="text"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={Boolean(fieldErrors.email)}
                    helperText={fieldErrors.email || " "}   // 항상 줄 차지
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
                    error={Boolean(fieldErrors.password)}
                    helperText={fieldErrors.password || " "}
                    disabled={isLoading}
                    onKeyPress={handleKeyPress}
                />

                <Box display="flex" flexDirection="column" justifyContent="space-between" gap={2} mt={2}>
                    <Button fullWidth variant="contained" onClick={onSubmit} disabled={isLoading}>{isLoading ? '로그인 중...' : '로그인'}</Button>
                    <Button fullWidth variant="outlined" onClick={() => navigate('/signup')} disabled={isLoading}>사용자 등록</Button>
                </Box>
            </Box>
        </Box>
    );
}
