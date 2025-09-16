// Firebase 인증 관련 상수들
export const AUTH_ERROR_MESSAGES = {
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

// 사용자 데이터 인터페이스 (JSDoc용)
export const USER_DATA_SCHEMA = {
  uid: 'string',
  email: 'string',
  displayName: 'string',
  userType: 'string',
  emailVerified: 'boolean'
};
