import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FIREBASE_USER_FIELDS, USER_TYPES } from '../constants/firebaseFields';

// 사용자 정보 생성
export const createUser = async (userData) => {
  try {
    const {
      uid,
      email,
      name,
      userType,
      phoneNumber = null,
      zipcode = null,
      roadAddress = null,
      addressDetail = null,
      certificateFile = null,
      preferredCategories = null
    } = userData;

    // 필수 필드 검증
    if (!uid || !email || !name || !userType) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    // 사용자 타입 검증
    if (!Object.values(USER_TYPES).includes(userType)) {
      throw new Error('올바르지 않은 사용자 타입입니다.');
    }

    // 사용자 문서 생성
    const userDoc = {
      [FIREBASE_USER_FIELDS.USER_ID]: uid,
      [FIREBASE_USER_FIELDS.EMAIL]: email,
      [FIREBASE_USER_FIELDS.USER_TYPE]: userType,
      [FIREBASE_USER_FIELDS.NAME]: name,
      [FIREBASE_USER_FIELDS.PHONE_NUMBER]: phoneNumber,
      [FIREBASE_USER_FIELDS.ZIPCODE]: zipcode,
      [FIREBASE_USER_FIELDS.ROAD_ADDRESS]: roadAddress,
      [FIREBASE_USER_FIELDS.ADDRESS_DETAIL]: addressDetail,
      [FIREBASE_USER_FIELDS.CERTIFICATE_FILE]: certificateFile, // 파일명만 저장
      [FIREBASE_USER_FIELDS.PREFERRED_CATEGORIES]: preferredCategories,
      [FIREBASE_USER_FIELDS.CREATED_AT]: new Date().toISOString(),
      [FIREBASE_USER_FIELDS.UPDATED_AT]: new Date().toISOString(),
      [FIREBASE_USER_FIELDS.LAST_LOGIN_AT]: new Date().toISOString()
    };

    // Firestore에 사용자 정보 저장 (users/{email} 경로로 저장)
    await setDoc(doc(db, 'users', email), userDoc);

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

// 사용자 정보 조회 (users/{email}에서 조회)
export const getUser = async (email) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    
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

// 사용자 정보 업데이트 (users/{email} 경로로 업데이트)
export const updateUser = async (email, updateData) => {
  try {
    const updatedData = {
      ...updateData,
      [FIREBASE_USER_FIELDS.UPDATED_AT]: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'users', email), updatedData);
    
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

// 사용자 정보 삭제 (users/{email}에서 삭제)
export const deleteUser = async (email) => {
  try {
    await deleteDoc(doc(db, 'users', email));
    
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
    const q = query(collection(db, 'users'), where(FIREBASE_USER_FIELDS.EMAIL, '==', email));
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
    const q = query(collection(db, 'users'), where(FIREBASE_USER_FIELDS.USER_TYPE, '==', userType));
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

// 사용자 존재 여부 확인 (users/{email}에서 확인)
export const checkUserExists = async (email) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    return userDoc.exists();
  } catch (error) {
    console.error('사용자 존재 확인 실패:', error);
    return false;
  }
}; 