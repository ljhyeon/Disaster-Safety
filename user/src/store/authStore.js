// 인증 상태 관리 스토어
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChange, signOutUser } from '../services/authService';
import { getUser } from '../services/userService';

// 인증 스토어 생성
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 상태
      user: null, // Firebase User + Firestore 유저 정보 통합
      isLoading: true, 
      isAuthenticated: false, 
      error: null,

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
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
          if (firebaseUser && firebaseUser.email) {
            // Firebase User 정보와 Firestore 유저 정보 통합
            const currentUser = get().user;
            let userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified
            };
            
            // 이미 persist된 정보가 있고 주소 정보가 있으면 사용
            if (currentUser && currentUser.road_address) {
              userData = { ...userData, ...currentUser };
            } else {
              // Firestore에서 최신 정보 불러오기
              console.log('Loading user data from Firestore for:', firebaseUser.email);
              const result = await getUser(firebaseUser.email);
              console.log('Firestore getUser result:', result);
              if (result.success && result.user) {
                userData = { ...userData, ...result.user };
                console.log('Final user data:', userData);
              }
            }
            
            set({ user: userData, isAuthenticated: true, isLoading: false, error: null });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
          }
        });
        return unsubscribe;
      },

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : userData
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
