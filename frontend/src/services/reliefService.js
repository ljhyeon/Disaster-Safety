// 구호품 관리 서비스
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  addDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// 구호품 카테고리 상수
export const RELIEF_CATEGORIES = {
  FOOD: '식량',
  LIVING: '생활용품',
  MEDICAL: '의약품',
  CLOTHING: '의류',
  CHILD: '유아·아동용품',
  OTHER: '기타'
};

// 구호품 세부 카테고리
export const RELIEF_SUBCATEGORIES = {
  FOOD: {
    INSTANT: '즉석식품',
    CANNED: '통조림',
    BEVERAGE: '음료',
    SNACK: '간식류'
  },
  LIVING: {
    HYGIENE: '위생용품',
    WOMEN: '여성용품',
    CLEANING: '세탁/청소',
    DAILY: '일상용품'
  },
  MEDICAL: {
    MEDICINE: '일반의약품',
    FIRST_AID: '구급용품',
    MASK: '마스크류',
    SUPPLEMENT: '건강보조식품'
  },
  CLOTHING: {
    WINTER: '방한용품',
    CLOTHES: '의류',
    UNDERWEAR: '속옷',
    SHOES: '신발류'
  },
  CHILD: {
    BABY_FOOD: '유아식',
    HYGIENE: '위생용품',
    TOYS: '놀이용품',
    CLOTHES: '아동복'
  },
  OTHER: {
    CUSTOM: '직접입력'
  }
};

// 구호품 요청 등록 (OFFC02)
export const createReliefRequest = async (requestData) => {
  try {
    const {
      shelterId,
      reliefItems,
      requesterId, // 요청한 공무원 ID
      priority = 'normal', // 우선순위 (urgent, high, normal, low)
      notes = '' // 추가 메모
    } = requestData;

    // 필수 필드 검증
    if (!shelterId || !reliefItems || !Array.isArray(reliefItems) || reliefItems.length === 0) {
      throw new Error('대피소 ID와 구호품 목록을 입력해주세요.');
    }

    // 구호품 아이템 검증
    for (const item of reliefItems) {
      if (!item.category || !item.subcategory || !item.item || !item.quantity || !item.unit) {
        throw new Error('구호품 정보를 모두 입력해주세요.');
      }
      
      if (isNaN(item.quantity) || item.quantity <= 0) {
        throw new Error('수량은 0보다 큰 숫자여야 합니다.');
      }
    }

    // 고유 ID 생성
    const requestId = `REQ${Date.now()}`;

    const requestDoc = {
      request_id: requestId,
      shelter_id: shelterId,
      requester_id: requesterId,
      relief_items: reliefItems,
      priority: priority,
      notes: notes,
      status: 'pending', // pending, in_progress, completed, cancelled
      total_items: reliefItems.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'relief_requests', requestId), requestDoc);

    return {
      success: true,
      request: requestDoc,
      message: '구호품 요청이 등록되었습니다.',
      request_id: requestId
    };

  } catch (error) {
    console.error('구호품 요청 등록 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'relief-request-failed',
        message: error.message || '구호품 요청 등록 중 오류가 발생했습니다.'
      }
    };
  }
};

// 대피소별 구호품 요청 조회
export const getReliefRequestsByShelter = async (shelterId) => {
  try {
    if (!shelterId) {
      return {
        success: false,
        error: {
          code: 'missing-shelter-id',
          message: '대피소 ID가 필요합니다.'
        }
      };
    }

    // orderBy 없이 조회 (인덱스 문제 방지)
    const q = query(
      collection(db, 'relief_requests'),
      where('shelter_id', '==', shelterId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push(doc.data());
    });
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return {
      success: true,
      requests: requests
    };
  } catch (error) {
    console.error('구호품 요청 조회 실패:', error);
    
    // 특별한 에러 처리
    if (error.code === 'failed-precondition') {
      return {
        success: false,
        error: {
          code: 'firestore-index-missing',
          message: 'Firestore 인덱스가 필요합니다. Firebase 콘솔에서 인덱스를 생성해주세요.'
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: error.code || 'relief-requests-fetch-failed',
        message: error.message || '구호품 요청 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 모든 구호품 요청 조회 (일반 사용자용)
export const getAllReliefRequests = async () => {
  try {
    // orderBy 없이 조회 (인덱스 문제 방지)
    const q = query(
      collection(db, 'relief_requests'),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push(doc.data());
    });
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return {
      success: true,
      requests: requests
    };
  } catch (error) {
    console.error('전체 구호품 요청 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'all-relief-requests-fetch-failed',
        message: error.message || '구호품 요청 목록 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 요청 상태 업데이트
export const updateReliefRequestStatus = async (requestId, status, notes = '') => {
  try {
    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(doc(db, 'relief_requests', requestId), updateData);
    
    return {
      success: true,
      message: '구호품 요청 상태가 업데이트되었습니다.'
    };
  } catch (error) {
    console.error('구호품 요청 상태 업데이트 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'relief-request-update-failed',
        message: error.message || '구호품 요청 상태 업데이트 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 공급 기록 추가
export const addReliefSupply = async (supplyData) => {
  try {
    const {
      shelterId,
      requestId,
      supplierId, // 공급자 ID
      suppliedItems,
      supplierName,
      supplierContact,
      notes = ''
    } = supplyData;

    // 필수 필드 검증
    if (!shelterId || !suppliedItems || !Array.isArray(suppliedItems) || suppliedItems.length === 0) {
      throw new Error('대피소 ID와 공급 물품 목록을 입력해주세요.');
    }

    // 고유 ID 생성
    const supplyId = `SUP${Date.now()}`;

    const supplyDoc = {
      supply_id: supplyId,
      shelter_id: shelterId,
      request_id: requestId || null,
      supplier_id: supplierId,
      supplier_name: supplierName,
      supplier_contact: supplierContact,
      supplied_items: suppliedItems,
      notes: notes,
      status: 'delivered', // delivered, pending, cancelled
      total_items: suppliedItems.length,
      created_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'relief_supplies', supplyId), supplyDoc);

    return {
      success: true,
      supply: supplyDoc,
      message: '구호품 공급 기록이 등록되었습니다.',
      supply_id: supplyId
    };
  } catch (error) {
    console.error('구호품 공급 기록 등록 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'relief-supply-failed',
        message: error.message || '구호품 공급 기록 등록 중 오류가 발생했습니다.'
      }
    };
  }
};

// 대피소별 구호품 공급 기록 조회
export const getReliefSuppliesByShelter = async (shelterId) => {
  try {
    if (!shelterId) {
      return {
        success: false,
        error: {
          code: 'missing-shelter-id',
          message: '대피소 ID가 필요합니다.'
        }
      };
    }

    // orderBy 없이 조회 (인덱스 문제 방지)
    const q = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId)
    );
    const querySnapshot = await getDocs(q);
    
    const supplies = [];
    querySnapshot.forEach((doc) => {
      supplies.push(doc.data());
    });
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    supplies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return {
      success: true,
      supplies: supplies
    };
  } catch (error) {
    console.error('대피소별 구호품 공급 기록 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'relief-supplies-fetch-failed',
        message: error.message || '구호품 공급 기록 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 통계 조회 (OFFC01용)
export const getReliefStatistics = async (shelterId, dateRange = 7) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);

    // 요청 기록 조회 (orderBy 제거하여 인덱스 문제 방지)
    const requestsQuery = query(
      collection(db, 'relief_requests'),
      where('shelter_id', '==', shelterId)
    );

    // 공급 기록 조회 (orderBy 제거하여 인덱스 문제 방지)
    const suppliesQuery = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId)
    );

    const [requestsSnapshot, suppliesSnapshot] = await Promise.all([
      getDocs(requestsQuery),
      getDocs(suppliesQuery)
    ]);

    const requests = [];
    const supplies = [];

    // 요청 데이터 필터링 (날짜 범위 적용)
    requestsSnapshot.forEach((doc) => {
      const request = doc.data();
      const requestDate = new Date(request.created_at);
      if (requestDate >= startDate && requestDate <= endDate) {
        requests.push(request);
      }
    });

    // 공급 데이터 필터링 (날짜 범위 적용)
    suppliesSnapshot.forEach((doc) => {
      const supply = doc.data();
      const supplyDate = new Date(supply.created_at);
      if (supplyDate >= startDate && supplyDate <= endDate) {
        supplies.push(supply);
      }
    });

    // 클라이언트에서 정렬
    requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    supplies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 날짜별 통계 계산
    const statisticsByDate = {};
    
    // 요청 통계
    requests.forEach(request => {
      const date = request.created_at.split('T')[0];
      if (!statisticsByDate[date]) {
        statisticsByDate[date] = { requested: 0, supplied: 0 };
      }
      statisticsByDate[date].requested += request.total_items;
    });

    // 공급 통계
    supplies.forEach(supply => {
      const date = supply.created_at.split('T')[0];
      if (!statisticsByDate[date]) {
        statisticsByDate[date] = { requested: 0, supplied: 0 };
      }
      statisticsByDate[date].supplied += supply.total_items;
    });

    // 배열 형태로 변환
    const reliefItems = Object.entries(statisticsByDate).map(([date, stats]) => ({
      date,
      requested: stats.requested,
      supplied: stats.supplied
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      success: true,
      statistics: {
        relief_items: reliefItems,
        total_requests: requests.length,
        total_supplies: supplies.length,
        pending_requests: requests.filter(r => r.status === 'pending').length
      }
    };
  } catch (error) {
    console.error('구호품 통계 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'relief-statistics-fetch-failed',
        message: error.message || '구호품 통계 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 카테고리별 통계
export const getReliefCategoryStatistics = async (shelterId) => {
  try {
    if (!shelterId) {
      return {
        success: false,
        error: {
          code: 'missing-shelter-id',
          message: '대피소 ID가 필요합니다.'
        }
      };
    }

    const requestsQuery = query(
      collection(db, 'relief_requests'),
      where('shelter_id', '==', shelterId)
    );

    const suppliesQuery = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId)
    );

    const [requestsSnapshot, suppliesSnapshot] = await Promise.all([
      getDocs(requestsQuery),
      getDocs(suppliesQuery)
    ]);

    const categoryStats = {};

    // 요청 통계
    requestsSnapshot.forEach((doc) => {
      const request = doc.data();
      if (request.relief_items && Array.isArray(request.relief_items)) {
        request.relief_items.forEach(item => {
          if (!categoryStats[item.category]) {
            categoryStats[item.category] = { requested: 0, supplied: 0 };
          }
          categoryStats[item.category].requested += item.quantity || 0;
        });
      }
    });

    // 공급 통계
    suppliesSnapshot.forEach((doc) => {
      const supply = doc.data();
      if (supply.supplied_items && Array.isArray(supply.supplied_items)) {
        supply.supplied_items.forEach(item => {
          if (!categoryStats[item.category]) {
            categoryStats[item.category] = { requested: 0, supplied: 0 };
          }
          categoryStats[item.category].supplied += item.quantity || 0;
        });
      }
    });

    return {
      success: true,
      categoryStats: categoryStats
    };
  } catch (error) {
    console.error('구호품 카테고리별 통계 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'relief-category-stats-failed',
        message: error.message || '구호품 카테고리별 통계 조회 중 오류가 발생했습니다.'
      }
    };
  }
}; 