# 🚨 Disaster Safety - User Application (사용자 화면)

> 재해 상황에서 구호품 요청 및 지원을 위한 React 기반 웹 애플리케이션

[![React](https://img.shields.io/badge/React-19.0.0--rc.1-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/MUI-7.2.0-007FFF?logo=mui)](https://mui.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.6-orange)](https://github.com/pmndrs/zustand)
[![PNPM](https://img.shields.io/badge/PNPM-10.11.0-F69220?logo=pnpm)](https://pnpm.io/)

## 📋 목차

- [개요](#-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행)
- [프로젝트 구조](#-프로젝트-구조)
- [환경 설정](#-환경-설정)
- [개발 가이드](#-개발-가이드)
- [API 문서](#-api-문서)
- [기여하기](#-기여하기)

## 🎯 개요

재해 상황에서 구호품 요청 및 지원을 위한 웹 애플리케이션입니다.   
실시간으로 대피소의 구호품 요청을 확인하고, 효율적으로 지원할 수 있는 플랫폼을 제공합니다.

## ✨ 주요 기능

### 🔐 사용자 인증
- 이메일/비밀번호 기반 회원가입 및 로그인
- 개인/기업 사용자 구분 및 권한 관리
- 비밀번호 재설정 기능

### 📦 구호품 관리
- **구호품 요청 조회**: 대피소별 실시간 구호품 요청 목록
- **구호품 지원**: 개인의 구호품 기부 및 배송 관리
- **상태 추적**: 지원한 구호품의 배송 상태 실시간 추적(TBD)

### 📊 데이터 시각화
- 구호품 통계 및 현황 대시보드
- 지역별/카테고리별 요청 현황 분석


## 🛠 기술 스택

### User Framework
- **React 19.0.0-rc**
- **Vite 7.0.0**
- **React Router DOM 7.6.3**

### UI/UX 라이브러리
- **Material-UI (MUI) 7.2.0**: Google Material Design 기반 컴포넌트
- **Emotion**: CSS-in-JS 스타일링
- **Pretendard Font**: 한글 최적화 폰트

### 상태 관리 & 데이터
- **Zustand 5.0.6**: 경량 상태 관리 라이브러리
- **Firebase 11.1.0**: 실시간 데이터베이스, 인증, 호스팅
- **Custom Hooks**: 재사용 가능한 비즈니스 로직

### 개발 도구
- **ESLint**: 코드 품질 및 일관성 관리
- **PNPM**: 빠르고 효율적인 패키지 관리
- **Vite Path Alias**: 절대 경로 import 지원

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18.0.0 이상
- PNPM 8.0.0 이상

### 설치 과정
```bash
# PNPM 설치 (전역)
npm install -g pnpm

# 저장소 클론
git clone <repository-url>

# 프로젝트 디렉토리 이동
cd user

# 의존성 설치
pnpm install
```

### 개발 환경 실행
```bash
# 개발 서버 시작 (Hot Reload 지원)
pnpm dev

# 브라우저에서 http://localhost:5173 접속
```

### 빌드 및 배포
```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview

# 코드 품질 검사
pnpm lint
```

## 📁 프로젝트 구조

```
user/
├── public/                    # 정적 파일
│   ├── setting.svg           # 설정 아이콘
│   ├── status.svg            # 상태 아이콘
│   └── supply.svg            # 구호품 아이콘
├── src/
│   ├── api/                  # API 통신 모듈(추후 API 연동시 사용)
│   │   └── demo.js          # 데모 API 함수
│   ├── assets/              # 애플리케이션 자산
│   │   └── react.svg        # React 로고
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── common/          # 공통 컴포넌트
│   │   │   ├── EmptyState.jsx      # 빈 상태 컴포넌트
│   │   │   ├── ErrorBoundary.jsx   # 에러 경계 컴포넌트
│   │   │   ├── ErrorState.jsx      # 에러 상태 컴포넌트
│   │   │   └── LoadingState.jsx    # 로딩 상태 컴포넌트
│   │   ├── dialogs/         # 모달/다이얼로그 컴포넌트
│   │   │   ├── AcceptedDialog.jsx      # 승인 다이얼로그
│   │   │   ├── AddressDialog.jsx       # 주소 입력 다이얼로그
│   │   │   ├── Form2Dialog.jsx         # 폼 다이얼로그
│   │   │   ├── LogoutConfirmDialog.jsx # 로그아웃 확인 다이얼로그
│   │   │   ├── RequestDetailDialog.jsx # 요청 상세 다이얼로그
│   │   │   ├── TrackingDialog.jsx      # 추적 다이얼로그
│   │   │   └── TrackingViewDialog.jsx  # 추적 보기 다이얼로그
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   │   └── Layout.jsx   # 메인 레이아웃
│   │   ├── supply/          # 구호품 관련 컴포넌트
│   │   │   ├── RequestItem.jsx     # 요청 아이템
│   │   │   ├── RequestList.jsx     # 요청 목록
│   │   │   ├── SupplyItem.jsx      # 구호품 아이템
│   │   │   ├── SupplyList.jsx      # 구호품 목록
│   │   │   └── TrackingInfo.jsx    # 추적 정보
│   │   ├── Item.jsx         # 일반 아이템 컴포넌트
│   │   └── Logo.jsx         # 로고 컴포넌트
│   ├── constants/           # 상수 정의
│   │   ├── authConstants.js     # 인증 관련 상수
│   │   ├── courierCompanies.js  # 택배사 정보
│   │   ├── reliefConstants.js   # 구호품 관련 상수
│   │   └── userConstants.js     # 사용자 관련 상수
│   ├── hooks/               # 커스텀 React 훅
│   │   ├── useAuth.js           # 인증 관리 훅
│   │   ├── useReliefRequests.js # 구호품 요청 관리 훅
│   │   ├── useSupplyStatistics.js # 구호품 통계 훅
│   │   ├── useUserDonations.js    # 사용자 기부 관리 훅
│   │   └── useUserSupplies.js     # 사용자 구호품 관리 훅
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Login.jsx        # 로그인 페이지
│   │   ├── Setting.jsx      # 설정 페이지
│   │   ├── SignUp.jsx       # 회원가입 페이지
│   │   ├── Status.jsx       # 상태 페이지
│   │   ├── Supply.jsx       # 구호품 페이지
│   │   └── routes.jsx       # 라우팅 설정
│   ├── services/            # 비즈니스 로직 & API 서비스
│   │   ├── firebase/        # Firebase 설정
│   │   │   └── config.js    # Firebase 초기화 설정
│   │   ├── authService.js   # 인증 서비스
│   │   ├── reliefService.js # 구호품 서비스
│   │   └── userService.js   # 사용자 서비스
│   ├── store/               # 전역 상태 관리
│   │   └── authStore.js     # 인증 상태 스토어
│   ├── utils/               # 유틸리티 함수
│   │   ├── formatDate.js    # 날짜 포맷팅
│   │   ├── mapping.jsx      # 데이터 매핑
│   │   └── requestUtils.js  # 요청 관련 유틸
│   ├── App.jsx              # 루트 애플리케이션 컴포넌트
│   ├── main.jsx             # 애플리케이션 진입점
│   ├── routes.jsx           # 메인 라우팅 설정
│   └── theme.js             # MUI 테마 설정
├── .env                     # 환경 변수 (개발용)
├── .gitignore              # Git 무시 파일 목록
├── eslint.config.js        # ESLint 설정
├── index.html              # HTML 템플릿
├── package.json            # NPM 패키지 설정
├── pnpm-lock.yaml         # PNPM 의존성 락 파일
├── README.md              # 프로젝트 문서
└── vite.config.js         # Vite 빌드 설정
```

### 아키텍처 특징

#### 🔧 **컴포넌트 아키텍처**
- **Atomic Design 패턴**: 작은 컴포넌트부터 큰 컴포넌트까지 체계적 구성
- **Container-Presentational 패턴**: 비즈니스 로직과 UI 로직 분리
- **HOC & Render Props**: 공통 로직 재사용을 위한 고차 컴포넌트 활용

#### 📊 **상태 관리 전략**
- **Zustand**: 경량화된 전역 상태 관리 (Redux 대체)
- **React Query 패턴**: 서버 상태와 클라이언트 상태 분리
- **Context API**: 테마, 언어 등 설정 상태 관리

#### 🔄 **데이터 플로우**
- **단방향 데이터 플로우**: 예측 가능한 상태 변화
- **Firebase Realtime**: 실시간 데이터 동기화
- **Optimistic Updates**: 사용자 경험 개선을 위한 낙관적 업데이트

## ⚙️ 환경 설정

### 환경 변수 (.env)
```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase 설정
1. Firebase Console에서 새 프로젝트 생성
2. Authentication, Firestore Database, Storage 활성화
3. 웹 앱 등록 후 환경 변수에 설정값 입력

## 👩‍💻 개발 가이드

### 코딩 컨벤션
```javascript
// 컴포넌트 명명: PascalCase
const UserProfile = () => { /* ... */ };

// 함수 명명: camelCase
const fetchUserData = async () => { /* ... */ };

// 상수 명명: UPPER_SNAKE_CASE
const API_ENDPOINTS = { /* ... */ };

// 커스텀 훅: use 접두사
const useUserData = () => { /* ... */ };
```

### 프로젝트 구조 규칙
- **컴포넌트**: 단일 책임 원칙 준수
- **훅**: 재사용 가능한 로직 분리
- **서비스**: API 통신 및 비즈니스 로직
- **유틸**: 순수 함수로 구성된 헬퍼

### 성능 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 연산 및 함수 메모이제이션
- **코드 스플리팅**: React.lazy를 통한 번들 크기 최적화
- **이미지 최적화**: WebP 포맷 및 lazy loading

---
