// 구호품 관리 서비스 (web-app용)
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// 구호품 카테고리 상수
export const RELIEF_CATEGORIES = {
  FOOD: '식량',
  DAILY_NECESSITIES: '생활용품',
  MEDICINE: '의약품',
  CLOTHING: '의류',
  BABY_CHILD: '유아·아동용품',
  OTHER: '기타'
};

// 구호품 세부 카테고리
export const RELIEF_SUBCATEGORIES = {
  [RELIEF_CATEGORIES.FOOD]: [
    '즉석식품', '통조림', '생수', '우유', '빵', '과자', '라면', '쌀', '기타 식품'
  ],
  [RELIEF_CATEGORIES.DAILY_NECESSITIES]: [
    '위생용품', '세면용품', '화장지', '수건', '담요', '베개', '생리용품', '기타 생활용품'
  ],
  [RELIEF_CATEGORIES.MEDICINE]: [
    '해열제', '감기약', '소화제', '진통제', '연고', '반창고', '소독약', '기타 의약품'
  ],
  [RELIEF_CATEGORIES.CLOTHING]: [
    '상의', '하의', '속옷', '양말', '신발', '외투', '잠옷', '기타 의류'
  ],
  [RELIEF_CATEGORIES.BABY_CHILD]: [
    '기저귀', '분유', '이유식', '젖병', '유아용품', '아동의류', '장난감', '기타 유아용품'
  ],
  [RELIEF_CATEGORIES.OTHER]: [
    '기타'
  ]
};

// 우선순위 상수
export const RELIEF_PRIORITY = {
  URGENT: '긴급',
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음'
};

// 단위 상수
export const RELIEF_UNITS = {
  PIECE: '개',
  PACK: '팩',
  BOX: '박스',
  KG: 'kg',
  LITER: 'L',
  BOTTLE: '병',
  SET: '세트',
  PAIR: '켤레'
};

// 구호품 요청 상태
export const RELIEF_REQUEST_STATUS = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨'
};

// 구호품 공급 상태
export const RELIEF_SUPPLY_STATUS = {
  PENDING: '대기중',
  CONFIRMED: '확인됨',
  DELIVERED: '전달완료',
  CANCELLED: '취소됨'
};

// 모든 구호품 요청 조회 (일반 사용자용)
export const getAllReliefRequests = async () => {
  try {
    const q = query(
      collection(db, 'relief_requests'),
      where('status', '==', RELIEF_REQUEST_STATUS.PENDING),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const requestData = docSnapshot.data();
      
      // 대피소 정보 가져오기
      const shelterDoc = await getDoc(doc(db, 'shelters', requestData.shelter_id));
      const shelterData = shelterDoc.exists() ? shelterDoc.data() : null;
      
      requests.push({
        id: docSnapshot.id,
        ...requestData,
        shelter: shelterData
      });
    }
    
    return {
      success: true,
      requests: requests
    };
  } catch (error) {
    console.error('구호품 요청 목록 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'requests-fetch-failed',
        message: error.message || '구호품 요청 목록을 불러오는 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 공급 등록
export const addReliefSupply = async (supplyData) => {
  try {
    const {
      requestId,
      supplierName,
      supplierPhone,
      supplierEmail,
      quantity,
      message: supplierMessage,
      userId
    } = supplyData;

    // 필수 필드 검증
    if (!requestId || !supplierName || !supplierPhone || !quantity || !userId) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    // 요청 정보 확인
    const requestDoc = await getDoc(doc(db, 'relief_requests', requestId));
    if (!requestDoc.exists()) {
      throw new Error('존재하지 않는 구호품 요청입니다.');
    }

    const requestData = requestDoc.data();

    // 공급 문서 생성
    const supplyDoc = {
      request_id: requestId,
      shelter_id: requestData.shelter_id,
      item_name: requestData.item_name,
      category: requestData.category,
      subcategory: requestData.subcategory,
      requested_quantity: requestData.quantity,
      supplied_quantity: quantity,
      unit: requestData.unit,
      priority: requestData.priority,
      supplier_name: supplierName,
      supplier_phone: supplierPhone,
      supplier_email: supplierEmail || '',
      supplier_message: supplierMessage || '',
      supplier_id: userId,
      status: RELIEF_SUPPLY_STATUS.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Firestore에 공급 정보 저장
    const docRef = await addDoc(collection(db, 'relief_supplies'), supplyDoc);

    return {
      success: true,
      supply_id: docRef.id,
      supply: supplyDoc
    };
  } catch (error) {
    console.error('구호품 공급 등록 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'supply-creation-failed',
        message: error.message || '구호품 공급 등록 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자별 구호품 공급 이력 조회
export const getReliefSuppliesByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'relief_supplies'),
      where('supplier_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const supplies = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const supplyData = docSnapshot.data();
      
      // 대피소 정보 가져오기
      const shelterDoc = await getDoc(doc(db, 'shelters', supplyData.shelter_id));
      const shelterData = shelterDoc.exists() ? shelterDoc.data() : null;
      
      supplies.push({
        id: docSnapshot.id,
        ...supplyData,
        shelter: shelterData
      });
    }
    
    return {
      success: true,
      supplies: supplies
    };
  } catch (error) {
    console.error('사용자별 구호품 공급 이력 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'supplies-fetch-failed',
        message: error.message || '구호품 공급 이력을 불러오는 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 공급 상태 업데이트
export const updateReliefSupplyStatus = async (supplyId, status) => {
  try {
    const supplyRef = doc(db, 'relief_supplies', supplyId);
    
    await updateDoc(supplyRef, {
      status: status,
      updated_at: new Date().toISOString()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('구호품 공급 상태 업데이트 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'supply-update-failed',
        message: error.message || '구호품 공급 상태 업데이트 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 공급 취소
export const cancelReliefSupply = async (supplyId) => {
  try {
    return await updateReliefSupplyStatus(supplyId, RELIEF_SUPPLY_STATUS.CANCELLED);
  } catch (error) {
    console.error('구호품 공급 취소 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'supply-cancel-failed',
        message: error.message || '구호품 공급 취소 중 오류가 발생했습니다.'
      }
    };
  }
};

// 대피소별 구호품 공급 현황 조회
export const getReliefSuppliesByShelter = async (shelterId) => {
  try {
    const q = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const supplies = [];
    
    querySnapshot.forEach((doc) => {
      supplies.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      supplies: supplies
    };
  } catch (error) {
    console.error('대피소별 구호품 공급 현황 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'supplies-fetch-failed',
        message: error.message || '구호품 공급 현황을 불러오는 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 공급 통계 조회
export const getReliefSupplyStatistics = async (shelterId = null) => {
  try {
    let q;
    if (shelterId) {
      q = query(collection(db, 'relief_supplies'), where('shelter_id', '==', shelterId));
    } else {
      q = query(collection(db, 'relief_supplies'));
    }
    
    const querySnapshot = await getDocs(q);
    const statistics = {
      total: 0,
      pending: 0,
      confirmed: 0,
      delivered: 0,
      cancelled: 0,
      by_category: {}
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      statistics.total++;
      
      // 상태별 집계
      switch (data.status) {
        case RELIEF_SUPPLY_STATUS.PENDING:
          statistics.pending++;
          break;
        case RELIEF_SUPPLY_STATUS.CONFIRMED:
          statistics.confirmed++;
          break;
        case RELIEF_SUPPLY_STATUS.DELIVERED:
          statistics.delivered++;
          break;
        case RELIEF_SUPPLY_STATUS.CANCELLED:
          statistics.cancelled++;
          break;
      }
      
      // 카테고리별 집계
      const category = data.category;
      if (!statistics.by_category[category]) {
        statistics.by_category[category] = 0;
      }
      statistics.by_category[category]++;
    });
    
    return {
      success: true,
      statistics: statistics
    };
  } catch (error) {
    console.error('구호품 공급 통계 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'statistics-fetch-failed',
        message: error.message || '구호품 공급 통계를 불러오는 중 오류가 발생했습니다.'
      }
    };
  }
}; 