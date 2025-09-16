// Firebase 인증 서비스
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUser, getUser } from './userService';

// 회원가입 (사용자 정보와 함께)
export const signUp = async (email, password, displayName = '', userType, termsAgreed = false, certFile = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 사용자 프로필 업데이트 (displayName 설정)
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Firestore에 사용자 정보 저장
    const userCreateResult = await createUser({
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      userType: userType,
      termsAgreed: termsAgreed,
      certFile: certFile
    });
    
    if (!userCreateResult.success) {
      console.error('Firestore 사용자 정보 저장 실패:', userCreateResult.error);
      // Firebase Auth 사용자는 생성되었지만 Firestore 저장 실패
      // 필요시 여기서 rollback 로직 추가 가능
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || displayName,
        emailVerified: user.emailVerified,
        userType: userType,
        termsAgreed: termsAgreed
      },
      firestoreResult: userCreateResult
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code)
      }
    };
  }
};

// 로그인 (Firestore 사용자 정보 포함)
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Firestore에서 사용자 정보 조회
    const userDataResult = await getUser(user.uid);
    let userData = null;
    
    if (userDataResult.success) {
      userData = userDataResult.user;
    } else {
      console.warn('Firestore 사용자 정보 조회 실패:', userDataResult.error);
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        // Firestore 데이터 추가
        userType: userData?.user_type || null,
        termsAgreed: userData?.terms_agreed || false,
        createdAt: userData?.created_at || null,
        updatedAt: userData?.updated_at || null
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code)
      }
    };
  }
};

// 로그아웃
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code)
      }
    };
  }
};

// 비밀번호 재설정 이메일 발송
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code)
      }
    };
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }

    // 현재 비밀번호로 재인증
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // 새 비밀번호로 업데이트
    await updatePassword(user, newPassword);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code)
      }
    };
  }
};

// 인증 상태 변경 리스너
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });
    } else {
      callback(null);
    }
  });
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    };
  }
  return null;
};

// 에러 메시지 한국어 변환
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.',
    'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    'auth/user-not-found': '존재하지 않는 사용자입니다.',
    'auth/wrong-password': '잘못된 비밀번호입니다.',
    'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/invalid-credential': '인증 정보가 올바르지 않습니다.',
    'auth/user-disabled': '비활성화된 사용자입니다.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    'auth/credential-already-in-use': '이미 사용 중인 인증 정보입니다.',
    'auth/invalid-verification-code': '인증 코드가 올바르지 않습니다.',
    'auth/invalid-verification-id': '인증 ID가 올바르지 않습니다.'
  };
  
  return errorMessages[errorCode] || '알 수 없는 오류가 발생했습니다.';
}; 