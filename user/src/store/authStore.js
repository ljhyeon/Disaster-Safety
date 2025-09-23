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
            let userData = {
              uid: firebaseUser.uid,
              user_id: firebaseUser.uid, // Firestore 필드명과 일치
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified
            };

            // 항상 Firestore에서 최신 정보 불러오기
            const result = await getUser(firebaseUser.email);

            if (result.success && result.user) {
              // Firestore 데이터와 병합
              userData = {
                ...userData,
                ...result.user,
                // 필드명 매핑 (snake_case를 유지)
                road_address: result.user.road_address,
                address_detail: result.user.address_detail,
                phone_number: result.user.phone_number,
                zipcode: result.user.zipcode,
                name: result.user.name || userData.displayName
              };
            } else if (!result.success && result.error?.code === 'user-not-found') {
              // 사용자 문서가 없으면 생성
              const { createUser } = await import('../services/userService');
              const createResult = await createUser({
                uid: firebaseUser.uid,
                user_id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                userType: 'general_user'
              });

              if (createResult.success) {
                userData = { ...userData, ...createResult.user };
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
