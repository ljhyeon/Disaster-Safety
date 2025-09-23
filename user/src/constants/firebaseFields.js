export const FIREBASE_SHELTER_FIELDS = [
    { label: '대피소명', value: 'shelterName' },
    { label: '주소', value: 'location' },
    { label: '위도', value: 'latitude' },
    { label: '경도', value: 'longitude' },
    { label: '재난유형', value: 'disasterType' },
    { label: '수용가능인원', value: 'capacity' },
    { label: '현재수용인원', value: 'currentOccupancy' },
    { label: '장애인편의시설', value: 'hasDisabledFacility' },
    { label: '반려동물수용', value: 'hasPetZone' },
    { label: '운영상태', value: 'status' },
    { label: '담당자명', value: 'contactPerson' },
    { label: '담당자연락처', value: 'contactPhone' }
];

// 사용자 필드 상수
export const FIREBASE_USER_FIELDS = {
    // 기본 필드
    USER_ID: 'user_id',
    EMAIL: 'email',
    USER_TYPE: 'user_type',
    NAME: 'name',

    // 연락처 정보
    PHONE_NUMBER: 'phone_number',

    // 주소 정보
    ZIPCODE: 'zipcode',
    ROAD_ADDRESS: 'road_address',
    ADDRESS_DETAIL: 'address_detail',

    // 인증서 정보 (관리자용)
    CERTIFICATE_FILE: 'certificate_file',

    // 선호도 정보
    PREFERRED_CATEGORIES: 'preferred_categories',

    // 타임스탬프
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    LAST_LOGIN_AT: 'last_login_at'
};

// 사용자 타입 상수
export const USER_TYPES = {
    PUBLIC_OFFICER: 'public_officer',
    GENERAL_USER: 'general_user'
};
