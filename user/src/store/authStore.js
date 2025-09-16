// 인증 상태 관리 스토어
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChange, signOutUser } from '../services/authService';

// 인증 스토어 생성
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 상태
      user: null, isLoading: true, isAuthenticated: false, error: null,

      // 액션
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      logout: async () => {
        set({ isLoading: true });
        try {
          const result = await signOutUser();
          if (result.success) {
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
            return { success: true };
          } else {
            set({ isLoading: false, error: result.error.message });
            return result;
          }
        } catch (error) {
          set({ isLoading: false, error: '로그아웃 중 오류가 발생했습니다.' });
          return { success: false, error: { message: '로그아웃 중 오류가 발생했습니다.' } };
        }
      },

      initializeAuth: () => {
        set({ isLoading: true });
        const unsubscribe = onAuthStateChange((user) => {
          set({ user, isAuthenticated: !!user, isLoading: false, error: null });
        });
        return unsubscribe;
      },

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),

      resetAuth: () => set({ user: null, isLoading: false, isAuthenticated: false, error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// 인증 상태 확인 헬퍼 함수들
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  return { isAuthenticated, isLoading };
};

export const useUser = () => {
  const { user } = useAuthStore();
  return user;
};
