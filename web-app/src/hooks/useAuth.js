// hooks/useAuth.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { USER_TYPES } from '../services/userService';

export const useAuth = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { setUser, logout } = useAuthStore();

    // 로그인
    const handleSignIn = async (email, password) => {
        if (!validateLoginForm(email, password)) return;

        setIsLoading(true);
        setErrorMessage('');

        try {
            const result = await signIn(email, password);
            if (result.success) {
                setUser(result.user);
                navigate('/home');
            } else {
                setErrorMessage(result.error.message);
            }
        } catch {
            setErrorMessage('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 회원가입
    const handleSignUp = async (email, password, confirmPassword, displayName, termsAgreed) => {
        if (!validateSignUpForm(email, password, confirmPassword, displayName, termsAgreed)) return;

        setIsLoading(true);
        setErrorMessage('');

        try {
            const result = await signUp(email, password, displayName, USER_TYPES.GENERAL_USER, termsAgreed);
            if (result.success) {
                alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
                navigate('/login');
            } else {
                setErrorMessage(result.error.message);
            }
        } catch {
            setErrorMessage('회원 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 로그아웃
    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                navigate('/login');
            } else {
                navigate('/login'); // 실패해도 강제 로그아웃
            }
        } catch {
            navigate('/login'); // 오류 발생해도 강제 로그아웃
        }
    };

    // 검증
    const validateLoginForm = (email, password) => {
        if (!email || !password) {
            setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('올바른 이메일 형식을 입력해주세요.');
            return false;
        }

        return true;
    };

    const validateSignUpForm = (email, password, confirmPassword, displayName, termsAgreed) => {
        if (!email || !password || !confirmPassword || !displayName) {
            setErrorMessage('모든 필드를 입력해주세요.');
            return false;
        }

        if (!termsAgreed) {
            setErrorMessage('이용약관에 동의해주세요.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('올바른 이메일 형식을 입력해주세요.');
            return false;
        }

        if (password !== confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return false;
        }

        if (password.length < 6) {
            setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
            return false;
        }

        return true;
    };

    return {
        isLoading,
        errorMessage,
        handleSignIn,
        handleSignUp,
        handleLogout,
        setErrorMessage
    };
};