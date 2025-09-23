// 데이터 동기화 및 캐싱을 위한 커스텀 훅
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getUserDonationItems } from '../services/reliefService';
import { getUser } from '../services/userService';
import { syncDonationSupplyStatus } from '../services/donationSupplyService';

// 캐시 만료 시간 (5분)
const CACHE_EXPIRY = 5 * 60 * 1000;

// 로컬 캐시 관리
const cache = new Map();

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const { data, timestamp } = cached;
  const now = Date.now();

  // 캐시가 만료되었는지 확인
  if (now - timestamp > CACHE_EXPIRY) {
    cache.delete(key);
    return null;
  }

  return data;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// 사용자 데이터 동기화 훅
export const useDataSync = () => {
  const { user, updateUser } = useAuthStore();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Firestore와 로컬 스토어 동기화
  const syncUserData = useCallback(async (forceRefresh = false) => {
    if (!user || !user.email) return;

    const cacheKey = `user_${user.email}`;

    // 캐시된 데이터가 있고 강제 새로고침이 아니면 캐시 사용
    if (!forceRefresh) {
      const cachedUser = getCachedData(cacheKey);
      if (cachedUser) {
        updateUser(cachedUser);
        return { success: true, fromCache: true };
      }
    }

    setSyncing(true);
    try {
      // Firestore에서 최신 사용자 정보 가져오기
      const result = await getUser(user.email);

      if (result.success && result.user) {
        // 로컬 스토어 업데이트
        updateUser(result.user);

        // 캐시에 저장
        setCachedData(cacheKey, result.user);

        setLastSync(new Date());
        return { success: true, fromCache: false };
      }

      return result;
    } catch (error) {
      console.error('데이터 동기화 실패:', error);
      return {
        success: false,
        error: {
          code: 'sync-failed',
          message: '데이터 동기화 중 오류가 발생했습니다.'
        }
      };
    } finally {
      setSyncing(false);
    }
  }, [user, updateUser]);

  // 기부 물품 데이터 동기화
  const syncDonationData = useCallback(async (forceRefresh = false) => {
    if (!user || !user.uid) return;

    const cacheKey = `donations_${user.uid}`;

    // 캐시된 데이터가 있고 강제 새로고침이 아니면 캐시 사용
    if (!forceRefresh) {
      const cachedDonations = getCachedData(cacheKey);
      if (cachedDonations) {
        return { success: true, donations: cachedDonations, fromCache: true };
      }
    }

    setSyncing(true);
    try {
      // 기부 물품 목록 가져오기
      const result = await getUserDonationItems(user.uid);

      if (result.success) {
        // 캐시에 저장
        setCachedData(cacheKey, result.donations);

        // 공급 상태 동기화
        await syncDonationSupplyStatus(user.uid);

        setLastSync(new Date());
        return { ...result, fromCache: false };
      }

      return result;
    } catch (error) {
      console.error('기부 물품 동기화 실패:', error);
      return {
        success: false,
        error: {
          code: 'sync-failed',
          message: '기부 물품 동기화 중 오류가 발생했습니다.'
        }
      };
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // 모든 데이터 동기화
  const syncAllData = useCallback(async (forceRefresh = false) => {
    const results = await Promise.all([
      syncUserData(forceRefresh),
      syncDonationData(forceRefresh)
    ]);

    return {
      success: results.every(r => r.success),
      results
    };
  }, [syncUserData, syncDonationData]);

  // 캐시 초기화
  const clearCache = useCallback(() => {
    cache.clear();
    setLastSync(null);
  }, []);

  // 주기적 동기화 (5분마다)
  useEffect(() => {
    if (!user) return;

    // 초기 동기화
    syncAllData();

    // 주기적 동기화 설정
    const interval = setInterval(() => {
      syncAllData();
    }, CACHE_EXPIRY);

    // 포커스 이벤트 시 동기화
    const handleFocus = () => {
      // 마지막 동기화로부터 1분 이상 지났으면 동기화
      if (!lastSync || Date.now() - lastSync.getTime() > 60000) {
        syncAllData();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  return {
    syncing,
    lastSync,
    syncUserData,
    syncDonationData,
    syncAllData,
    clearCache
  };
};

// 낙관적 업데이트를 위한 훅
export const useOptimisticUpdate = () => {
  const [pendingUpdates, setPendingUpdates] = useState([]);

  const addOptimisticUpdate = useCallback((id, data) => {
    setPendingUpdates(prev => [...prev, { id, data, timestamp: Date.now() }]);
  }, []);

  const resolveOptimisticUpdate = useCallback((id, success = true) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== id));

    if (!success) {
      // 실패 시 롤백 로직
      console.warn('낙관적 업데이트 실패:', id);
    }
  }, []);

  const clearPendingUpdates = useCallback(() => {
    setPendingUpdates([]);
  }, []);

  return {
    pendingUpdates,
    addOptimisticUpdate,
    resolveOptimisticUpdate,
    clearPendingUpdates
  };
};

// 오프라인 지원 훅
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToOfflineQueue = useCallback((action) => {
    setOfflineQueue(prev => [...prev, {
      ...action,
      id: Date.now(),
      timestamp: new Date()
    }]);
  }, []);

  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    console.log('처리 중인 오프라인 작업:', offlineQueue.length);

    for (const action of offlineQueue) {
      try {
        // 작업 실행
        await action.execute();
      } catch (error) {
        console.error('오프라인 작업 실행 실패:', error);
      }
    }

    setOfflineQueue([]);
  }, [offlineQueue]);

  return {
    isOnline,
    offlineQueue,
    addToOfflineQueue,
    processOfflineQueue
  };
};

export default {
  useDataSync,
  useOptimisticUpdate,
  useOfflineSupport
};