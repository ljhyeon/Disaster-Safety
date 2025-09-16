// 사용자 정보 관리 서비스
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';
import { FIREBASE_USER_FIELDS, USER_TYPES } from '../constants/firebaseFields';

// 유틸리티 함수들
const validateUserData = (userData) => {
  const { uid, email, displayName, userType } = userData;
  if (!uid || !email || !displayName || !userType) throw new Error('필수 필드가 누락되었습니다.');
  if (!Object.values(USER_TYPES).includes(userType)) throw new Error('올바르지 않은 사용자 타입입니다.');
};

const validatePublicOfficerCert = (userType, certFile) => {
  if (userType === USER_TYPES.PUBLIC_OFFICER && !certFile) console.warn('공무원 사용자는 인증서 파일이 필요합니다. (추후 구현 예정)');
};

const createUserDocument = (userData) => {
  const {
    uid,
    email,
    displayName,
    userType,
    phoneNumber = null,
    zipcode = null,
    roadAddress = null,
    addressDetail = null,
    certFile = null,
    preferredCategories = null
  } = userData;
  const now = new Date().toISOString();
  return {
    [FIREBASE_USER_FIELDS.USER_ID]: uid || null,
    [FIREBASE_USER_FIELDS.EMAIL]: email || null,
    [FIREBASE_USER_FIELDS.USER_TYPE]: 'general_user', // 기본값 설정
    [FIREBASE_USER_FIELDS.NAME]: displayName || null,
    [FIREBASE_USER_FIELDS.PHONE_NUMBER]: phoneNumber,
    [FIREBASE_USER_FIELDS.ZIPCODE]: zipcode,
    [FIREBASE_USER_FIELDS.ROAD_ADDRESS]: roadAddress,
    [FIREBASE_USER_FIELDS.ADDRESS_DETAIL]: addressDetail,
    [FIREBASE_USER_FIELDS.CERTIFICATE_FILE]: certFile,
    [FIREBASE_USER_FIELDS.PREFERRED_CATEGORIES]: preferredCategories,
    [FIREBASE_USER_FIELDS.CREATED_AT]: now,
    [FIREBASE_USER_FIELDS.UPDATED_AT]: now,
    [FIREBASE_USER_FIELDS.LAST_LOGIN_AT]: null
  };
};

const createUpdateDocument = (updateData) => ({ ...updateData, [FIREBASE_USER_FIELDS.UPDATED_AT]: new Date().toISOString() });

// 사용자 정보 생성
export const createUser = async (userData) => {
  try {
    validateUserData(userData);
    validatePublicOfficerCert(userData.userType, userData.certFile);
  const userDoc = createUserDocument(userData);
  // store by email as document id
  await setDoc(doc(db, 'users', userData.email), userDoc);
    return { success: true, user: userDoc };
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    return { success: false, error: { code: error.code || 'user-creation-failed', message: error.message || '사용자 생성 중 오류가 발생했습니다.' } };
  }
};

// 사용자 정보 조회
export const getUser = async (email) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) return { success: true, user: userDoc.data() };
    else return { success: false, error: { code: 'user-not-found', message: '사용자를 찾을 수 없습니다.' } };
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    return { success: false, error: { code: error.code || 'user-fetch-failed', message: error.message || '사용자 조회 중 오류가 발생했습니다.' } };
  }
};

// 사용자 정보 업데이트
export const updateUser = async (email, updateData) => {
  try {
    const updatedData = createUpdateDocument(updateData);
    await updateDoc(doc(db, 'users', email), updatedData);
    return { success: true, user: updatedData };
  } catch (error) {
    console.error('사용자 업데이트 실패:', error);
    return { success: false, error: { code: error.code || 'user-update-failed', message: error.message || '사용자 정보 업데이트 중 오류가 발생했습니다.' } };
  }
};

// 사용자 정보 삭제
export const deleteUser = async (email) => {
  try {
    await deleteDoc(doc(db, 'users', email));
    return { success: true };
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    return { success: false, error: { code: error.code || 'user-delete-failed', message: error.message || '사용자 삭제 중 오류가 발생했습니다.' } };
  }
};

// 이메일로 사용자 조회
export const getUserByEmail = async (email) => {
  try {
    const user = await fetchUserByEmail(email);
    if (user) return { success: true, user };
    else return { success: false, error: { code: 'user-not-found', message: '사용자를 찾을 수 없습니다.' } };
  } catch (error) {
    console.error('이메일로 사용자 조회 실패:', error);
    return { success: false, error: { code: error.code || 'user-fetch-failed', message: error.message || '사용자 조회 중 오류가 발생했습니다.' } };
  }
};

const fetchUserByEmail = async (email) => {
  const q = query(collection(db, 'users'), where(FIREBASE_USER_FIELDS.EMAIL, '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty ? querySnapshot.docs[0].data() : null;
};

// 사용자 타입별 조회
export const getUsersByType = async (userType) => {
  try {
    const users = await fetchUsersByType(userType);
    return { success: true, users };
  } catch (error) {
    console.error('사용자 타입별 조회 실패:', error);
    return { success: false, error: { code: error.code || 'users-fetch-failed', message: error.message || '사용자 목록 조회 중 오류가 발생했습니다.' } };
  }
};

const fetchUsersByType = async (userType) => {
  const q = query(collection(db, 'users'), where(FIREBASE_USER_FIELDS.USER_TYPE, '==', userType));
  const querySnapshot = await getDocs(q);
  const users = [];
  querySnapshot.forEach((doc) => users.push(doc.data()));
  return users;
};

// 사용자 존재 여부 확인
export const checkUserExists = async (email) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    return userDoc.exists();
  } catch (error) {
    console.error('사용자 존재 확인 실패:', error);
    return false;
  }
};
