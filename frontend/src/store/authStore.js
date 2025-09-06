// 인증 상태 관리 스토어
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChange, signOutUser } from '../services/authService';

// 인증 스토어 생성
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 상태
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // 액션
      // 사용자 설정
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        error: null 
      }),

      // 로딩 상태 설정
      setLoading: (isLoading) => set({ isLoading }),

      // 에러 설정
      setError: (error) => set({ error }),

      // 에러 클리어
      clearError: () => set({ error: null }),

      // 로그아웃
      logout: async () => {
        set({ isLoading: true });
        try {
          const result = await signOutUser();
          if (result.success) {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
            return { success: true };
          } else {
            set({ 
              isLoading: false,
              error: result.error.message 
            });
            return result;
          }
        } catch (error) {
          set({ 
            isLoading: false,
            error: '로그아웃 중 오류가 발생했습니다.' 
          });
          return { success: false, error: { message: '로그아웃 중 오류가 발생했습니다.' } };
        }
      },

      // 인증 상태 초기화
      initializeAuth: () => {
        set({ isLoading: true });
        
        // Firebase 인증 상태 변경 리스너 등록
        const unsubscribe = onAuthStateChange((user) => {
          set({ 
            user, 
            isAuthenticated: !!user,
            isLoading: false,
            error: null 
          });
        });

        return unsubscribe;
      },

      // 사용자 정보 업데이트
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),

      // 인증 상태 리셋
      resetAuth: () => set({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      })
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }), // 지속할 상태만 선택
    }
  )
);

// 인증 상태 확인 헬퍼 함수들
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
};

// 인증된 사용자만 접근 가능한지 확인
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  return { isAuthenticated, isLoading };
};

// 사용자 정보 가져오기
export const useUser = () => {
  const { user } = useAuthStore();
  return user;
}; 