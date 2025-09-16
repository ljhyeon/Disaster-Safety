import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingState } from './components/common/LoadingState';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy loading으로 컴포넌트 import
const Login = lazy(() => import('@/pages/Login.jsx'));
const SignUp = lazy(() => import('@/pages/SignUp.jsx'));
const Status = lazy(() => import('@/pages/Status.jsx'));
const Supply = lazy(() => import('@/pages/Supply.jsx'));
const Setting = lazy(() => import('@/pages/Setting.jsx'));

// Suspense fallback 컴포넌트
const LoadingFallback = () => (
  <LoadingState message="페이지를 불러오는 중..." />
);

export const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/supply" element={<Supply />} />
          <Route path="/status" element={<Status />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
