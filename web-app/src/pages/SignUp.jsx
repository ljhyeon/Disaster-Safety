import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

export default function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const { isLoading, errorMessage, handleSignUp, setErrorMessage } = useAuth();

    const onSubmit = () => {
        setErrorMessage('');
        handleSignUp(email, password, confirmPassword, displayName, termsAgreed);
    };

    return (
        <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px: 2, boxSizing: 'border-box' }}>
            <Logo />
            <Box width="85%" my={2}>
                <TextField fullWidth label="이름" variant="outlined" margin="normal" value={displayName} onChange={e => setDisplayName(e.target.value)} error={Boolean(errorMessage && !displayName)} disabled={isLoading} />
                <TextField fullWidth label="이메일" type="email" variant="outlined" margin="normal" value={email} onChange={e => setEmail(e.target.value)} error={Boolean(errorMessage && !email)} disabled={isLoading} />
                <TextField fullWidth label="비밀번호" type="password" variant="outlined" margin="normal" value={password} onChange={e => setPassword(e.target.value)} error={Boolean(errorMessage && !password)} disabled={isLoading} helperText="6자 이상 입력해주세요" />
                <TextField fullWidth label="비밀번호 확인" type="password" variant="outlined" margin="normal" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} error={Boolean(errorMessage && !confirmPassword)} disabled={isLoading} onKeyPress={e => { if (e.key === 'Enter') handleSignUp(); }} />
                <FormControlLabel control={<Checkbox checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} disabled={isLoading} color="primary" />} label={<Typography variant="body2">이용약관 및 개인정보처리방침에 동의합니다. (필수)</Typography>} sx={{ mt: 2, mb: 1 }} />
                {errorMessage && <Typography variant="body2" color="error" mt={1}>{errorMessage}</Typography>}
                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button fullWidth variant="outlined" onClick={() => navigate('/login')} sx={{ mr: 1 }} disabled={isLoading}>로그인으로 이동</Button>
                    <Button fullWidth variant="contained" onClick={onSubmit} sx={{ ml: 1 }} disabled={isLoading}>{isLoading ? '등록 중...' : '사용자 등록'}</Button>
                </Box>
            </Box>
        </Box>
    );
}
