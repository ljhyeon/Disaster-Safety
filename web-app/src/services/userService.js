// 사용자 정보 관리 서비스
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// 사용자 타입 상수
export const USER_TYPES = {
  PUBLIC_OFFICER: 'public_officer',
  GENERAL_USER: 'general_user'
};

// 사용자 정보 생성
export const createUser = async (userData) => {
  try {
    const { uid, email, displayName, userType, termsAgreed, certFile = null } = userData;
    
    // 필수 필드 검증
    if (!uid || !email || !displayName || !userType || typeof termsAgreed !== 'boolean') {
      throw new Error('필수 필드가 누락되었습니다.');
    }
    
    // 사용자 타입 검증
    if (!Object.values(USER_TYPES).includes(userType)) {
      throw new Error('올바르지 않은 사용자 타입입니다.');
    }
    
    // 공무원인 경우 인증서 파일 필요 (추후 구현)
    if (userType === USER_TYPES.PUBLIC_OFFICER && !certFile) {
      console.warn('공무원 사용자는 인증서 파일이 필요합니다. (추후 구현 예정)');
    }
    
    // 사용자 문서 생성
    const userDoc = {
      user_id: uid,
      email: email,
      display_name: displayName,
      user_type: userType,
      terms_agreed: termsAgreed,
      cert_file: certFile, // 추후 Storage URL로 변경 예정
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Firestore에 사용자 정보 저장
    await setDoc(doc(db, 'users', uid), userDoc);
    
    return {
      success: true,
      user: userDoc
    };
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'user-creation-failed',
        message: error.message || '사용자 생성 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자 정보 조회
export const getUser = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      return {
        success: true,
        user: userDoc.data()
      };
    } else {
      return {
        success: false,
        error: {
          code: 'user-not-found',
          message: '사용자를 찾을 수 없습니다.'
        }
      };
    }
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'user-fetch-failed',
        message: error.message || '사용자 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자 정보 업데이트
export const updateUser = async (uid, updateData) => {
  try {
    const updatedData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'users', uid), updatedData);
    
    return {
      success: true,
      user: updatedData
    };
  } catch (error) {
    console.error('사용자 업데이트 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'user-update-failed',
        message: error.message || '사용자 정보 업데이트 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자 정보 삭제
export const deleteUser = async (uid) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
    
    return {
      success: true
    };
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'user-delete-failed',
        message: error.message || '사용자 삭제 중 오류가 발생했습니다.'
      }
    };
  }
};

// 이메일로 사용자 조회
export const getUserByEmail = async (email) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        success: true,
        user: userDoc.data()
      };
    } else {
      return {
        success: false,
        error: {
          code: 'user-not-found',
          message: '사용자를 찾을 수 없습니다.'
        }
      };
    }
  } catch (error) {
    console.error('이메일로 사용자 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'user-fetch-failed',
        message: error.message || '사용자 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자 타입별 조회
export const getUsersByType = async (userType) => {
  try {
    const q = query(collection(db, 'users'), where('user_type', '==', userType));
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    
    return {
      success: true,
      users: users
    };
  } catch (error) {
    console.error('사용자 타입별 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'users-fetch-failed',
        message: error.message || '사용자 목록 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자 존재 여부 확인
export const checkUserExists = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (error) {
    console.error('사용자 존재 확인 실패:', error);
    return false;
  }
}; 