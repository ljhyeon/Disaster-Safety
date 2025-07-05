import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material';

import { Logo } from '../components/Logo';
import { signUp } from '../services/authService';
import { USER_TYPES } from '../services/userService';

export function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        // 입력값 검증
        if (!email || !password || !confirmPassword || !displayName) {
            setErrorMessage('모든 필드를 입력해주세요.');
            return;
        }

        // 이용약관 동의 확인
        if (!termsAgreed) {
            setErrorMessage('이용약관에 동의해주세요.');
            return;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('올바른 이메일 형식을 입력해주세요.');
            return;
        }

        // 비밀번호 확인
        if (password !== confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 비밀번호 길이 검증
        if (password.length < 6) {
            setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            // 일반 사용자로 회원가입
            const result = await signUp(
                email, 
                password, 
                displayName, 
                USER_TYPES.GENERAL_USER, 
                termsAgreed
            );
            
            if (result.success) {
                console.log('회원 등록 성공:', result.user);
                console.log('Firestore 저장 결과:', result.firestoreResult);
                alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
            } else {
                setErrorMessage(result.error.message);
            }
        } catch (error) {
            console.error('회원 등록 실패:', error);
            setErrorMessage('회원 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                    label="이름"
                    variant="outlined"
                    margin="normal"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    error={Boolean(errorMessage && !displayName)}
                    disabled={isLoading}
                />
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
                    helperText="6자 이상 입력해주세요"
                />
                <TextField
                    fullWidth
                    label="비밀번호 확인"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={Boolean(errorMessage && !confirmPassword)}
                    disabled={isLoading}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSignUp();
                        }
                    }}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={termsAgreed}
                            onChange={(e) => setTermsAgreed(e.target.checked)}
                            disabled={isLoading}
                            color="primary"
                        />
                    }
                    label={
                        <Typography variant="body2">
                            이용약관 및 개인정보처리방침에 동의합니다. (필수)
                        </Typography>
                    }
                    sx={{ mt: 2, mb: 1 }}
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
                        onClick={() => navigate('/login')}
                        sx={{ mr: 1 }}
                        disabled={isLoading}
                    >
                        로그인으로 이동
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSignUp}
                        sx={{ ml: 1 }}
                        disabled={isLoading}
                    >
                        {isLoading ? '등록 중...' : '사용자 등록'}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}