// Firebase 인증 서비스
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  updateProfile, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword
} from 'firebase/auth';
import { auth } from './firebase/config';
import { createUser, getUser } from './userService';
import { AUTH_ERROR_MESSAGES } from '../constants/authConstants';

// 사용자 데이터 검증
const validateUserData = (userData) => {
  const { uid, email, displayName, userType, termsAgreed } = userData;
  if (!uid || !email || !displayName || !userType || typeof termsAgreed !== 'boolean') throw new Error('필수 필드가 누락되었습니다.');
  return true;
};

// Firebase Auth 사용자 생성 및 프로필 업데이트
const createFirebaseUser = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  if (displayName) await updateProfile(user, { displayName });
  return user;
};

// Firestore에 사용자 정보 저장
const saveUserToFirestore = async (user, userData) => {
  const { userType, termsAgreed, certFile } = userData;
  const userCreateResult = await createUser({
    uid: user.uid, email: user.email, displayName: user.displayName || userData.displayName,
    userType, termsAgreed, certFile
  });
  if (!userCreateResult.success) console.error('Firestore 사용자 정보 저장 실패:', userCreateResult.error);
  return userCreateResult;
};

// 사용자 인증 정보 구성
const buildAuthResult = (user, userData) => ({
  uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified,
  userType: userData?.user_type || null, termsAgreed: userData?.terms_agreed || false,
  createdAt: userData?.created_at || null, updatedAt: userData?.updated_at || null
});

// 에러 코드에 따른 메시지 변환
const getErrorMessage = (errorCode) => AUTH_ERROR_MESSAGES[errorCode] || '알 수 없는 오류가 발생했습니다.';

// 회원가입 (사용자 정보와 함께)
export const signUp = async (email, password, displayName = '', userType, termsAgreed = false, certFile = null) => {
  try {
    validateUserData({ uid: 'temp', email, displayName, userType, termsAgreed });
    const user = await createFirebaseUser(email, password, displayName);
    const userCreateResult = await saveUserToFirestore(user, { userType, termsAgreed, certFile, displayName });
    return { success: true, user: buildAuthResult(user, userCreateResult.user) };
  } catch (error) {
    return { success: false, error: { code: error.code, message: getErrorMessage(error.code) } };
  }
};

// 로그인 (Firestore 사용자 정보 포함)
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDataResult = await getUser(user.uid);
    const userData = userDataResult.success ? userDataResult.user : null;
    if (!userDataResult.success) console.warn('Firestore 사용자 정보 조회 실패:', userDataResult.error);
    return {
      success: true,
      user: {
        uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified,
        userType: userData?.user_type || null, termsAgreed: userData?.terms_agreed || false,
        createdAt: userData?.created_at || null, updatedAt: userData?.updated_at || null
      }
    };
  } catch (error) {
    return { success: false, error: { code: error.code, message: getErrorMessage(error.code) } };
  }
};

// 로그아웃
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: { code: error.code, message: getErrorMessage(error.code) } };
  }
};

// 비밀번호 재설정 이메일 발송
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: { code: error.code, message: getErrorMessage(error.code) } };
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되어 있지 않습니다.');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: { code: error.code, message: getErrorMessage(error.code) } };
  }
};

// 인증 상태 변경 리스너
export const onAuthStateChange = (callback) => onAuthStateChanged(auth, (user) => {
  if (user) callback({ uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified });
  else callback(null);
});

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  const user = auth.currentUser;
  return user ? { uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified } : null;
};
