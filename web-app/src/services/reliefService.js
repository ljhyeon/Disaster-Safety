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

// Firebase 연결 테스트
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Firebase 연결 테스트 시작...');
    const testQuery = query(collection(db, 'relief_requests'), limit(1));
    const snapshot = await getDocs(testQuery);
    console.log('✅ Firebase 연결 성공! 테스트 결과:', snapshot.size);
    return true;
  } catch (error) {
    console.error('❌ Firebase 연결 실패:', error);
    return false;
  }
};

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
  SHIPPED: '배송중',
  DELIVERED: '전달완료',
  CANCELLED: '취소됨'
};

// 모든 구호품 요청 조회 (일반 사용자용)
export const getAllReliefRequests = async () => {
  try {
    console.log('📦 구호품 요청 데이터 조회 시작...');
    
    // 모든 구호품 요청을 조회 (상태 필터링 없이)
    const q = query(collection(db, 'relief_requests'));
    
    const querySnapshot = await getDocs(q);
    console.log('📊 조회된 구호품 요청 수:', querySnapshot.size);
    
    const requests = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const requestData = docSnapshot.data();
      console.log('📦 구호품 요청 원본 데이터:', docSnapshot.id, requestData);
      
      // 대피소 정보 가져오기
      let shelterData = null;
      try {
        if (requestData.shelter_id) {
          const shelterDoc = await getDoc(doc(db, 'shelters', requestData.shelter_id));
          if (shelterDoc.exists()) {
            shelterData = shelterDoc.data();
            console.log('🏠 대피소 정보:', shelterData);
          }
        }
      } catch (shelterError) {
        console.warn('대피소 정보 조회 실패:', shelterError);
      }
      
      // relief_items 배열 처리
      let processedItems = [];
      if (requestData.relief_items && Array.isArray(requestData.relief_items)) {
        processedItems = requestData.relief_items.map(item => ({
          item_name: item.item || item.item_name || '구호품',
          category: item.category || '기타',
          subcategory: item.subcategory || '기타',
          quantity: item.quantity || 0,
          unit: item.unit || '개',
          priority: item.priority || requestData.priority || 'normal',
          notes: item.notes || ''
        }));
      }
      
      // 첫 번째 항목을 기본 정보로 사용 (기존 UI 호환성)
      const firstItem = processedItems.length > 0 ? processedItems[0] : {
        item_name: '구호품',
        category: '기타',
        subcategory: '기타',
        quantity: 0,
        unit: '개',
        priority: 'normal'
      };
      
      const processedRequest = {
        id: docSnapshot.id,
        request_id: requestData.request_id || docSnapshot.id,
        shelter_id: requestData.shelter_id,
        item_name: firstItem.item_name,
        category: firstItem.category,
        subcategory: firstItem.subcategory,
        quantity: firstItem.quantity,
        unit: firstItem.unit,
        priority: requestData.priority || firstItem.priority,
        status: requestData.status || 'pending',
        created_at: requestData.created_at,
        updated_at: requestData.updated_at,
        total_items: requestData.total_items || processedItems.length || 1,
        relief_items: processedItems,
        notes: requestData.notes || '',
        requester_id: requestData.requester_id,
        shelter: shelterData
      };
      
      console.log('✅ 처리된 구호품 요청:', processedRequest);
      requests.push(processedRequest);
    }
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    requests.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
    
    console.log('✅ 구호품 요청 데이터 조회 완료:', requests.length, '개');
    console.log('📋 최종 요청 목록:', requests);
    
    return {
      success: true,
      requests: requests
    };
  } catch (error) {
    console.error('❌ 구호품 요청 목록 조회 실패:', error);
    
    // 에러 발생 시 빈 배열 반환 (무한 로딩 방지)
    console.warn('🔄 에러 발생으로 빈 배열을 반환합니다.');
    return {
      success: true,
      requests: []
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
    
    // relief_items 배열에서 첫 번째 항목 정보 추출
    const firstItem = requestData.relief_items && requestData.relief_items.length > 0 
      ? requestData.relief_items[0] 
      : {};

    // 공급 문서 생성
    const supplyDoc = {
      request_id: requestId,
      shelter_id: requestData.shelter_id,
      item_name: firstItem.item || firstItem.item_name || '구호품',
      category: firstItem.category || '기타',
      subcategory: firstItem.subcategory || '기타',
      requested_quantity: firstItem.quantity || 0,
      supplied_quantity: quantity,
      unit: firstItem.unit || '개',
      priority: requestData.priority || firstItem.priority || 'normal',
      supplier_name: supplierName,
      supplier_phone: supplierPhone,
      supplier_email: supplierEmail || '',
      supplier_message: supplierMessage || '',
      supplier_id: userId,
      status: 'pending', // RELIEF_SUPPLY_STATUS.PENDING 대신 직접 문자열 사용
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

// 간단한 구호품 공급 등록 (새로운 플로우용)
export const addReliefSupplySimple = async (requestId, userId, itemData) => {
  try {
    // 필수 필드 검증
    if (!requestId || !userId || !itemData) {
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
      shelter_id: itemData.shelter_id || requestData.shelter_id,
      item_name: itemData.item_name,
      category: itemData.category,
      subcategory: itemData.subcategory,
      requested_quantity: itemData.requested_quantity || itemData.quantity, // 원래 요청 수량
      supplied_quantity: itemData.quantity, // 실제 공급 수량
      unit: itemData.unit,
      priority: itemData.priority,
      supplier_name: '', // 나중에 송장번호 등록 시 입력
      supplier_phone: '',
      supplier_email: '',
      supplier_message: itemData.notes || '',
      supplier_id: userId,
      status: 'pending',
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
    // orderBy 없이 조회 (인덱스 문제 방지)
    const q = query(
      collection(db, 'relief_supplies'),
      where('supplier_id', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const supplies = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const supplyData = docSnapshot.data();
      
      // 대피소 정보 가져오기
      let shelterData = null;
      try {
        const shelterDoc = await getDoc(doc(db, 'shelters', supplyData.shelter_id));
        if (shelterDoc.exists()) {
          shelterData = shelterDoc.data();
        }
      } catch (shelterError) {
        console.warn('대피소 정보 조회 실패:', shelterError);
      }
      
      supplies.push({
        id: docSnapshot.id,
        ...supplyData,
        shelter: shelterData
      });
    }
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    supplies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
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
      supplies.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    supplies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
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

// 사용자 희망 기부 물품 관련 서비스 함수들

// 사용자 희망 기부 물품 등록
export const addUserDonationItem = async (userId, itemData) => {
  try {
    const { item } = itemData;
    
    if (!userId || !item) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    const donationDoc = {
      user_id: userId,
      item_name: item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active' // active, inactive
    };

    const docRef = await addDoc(collection(db, 'user_donations'), donationDoc);

    return {
      success: true,
      donation_id: docRef.id,
      donation: donationDoc
    };
  } catch (error) {
    console.error('희망 기부 물품 등록 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'donation-creation-failed',
        message: error.message || '희망 기부 물품 등록 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자 희망 기부 물품 목록 조회
export const getUserDonationItems = async (userId) => {
  try {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }

    const q = query(
      collection(db, 'user_donations'),
      where('user_id', '==', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // 생성일 기준 내림차순 정렬
    donations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      success: true,
      donations: donations
    };
  } catch (error) {
    console.error('희망 기부 물품 목록 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'donations-fetch-failed',
        message: error.message || '희망 기부 물품 목록을 불러오는 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자 희망 기부 물품 삭제
export const deleteUserDonationItem = async (donationId) => {
  try {
    if (!donationId) {
      throw new Error('기부 물품 ID가 필요합니다.');
    }

    const donationRef = doc(db, 'user_donations', donationId);
    await updateDoc(donationRef, {
      status: 'inactive',
      updated_at: new Date().toISOString()
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('희망 기부 물품 삭제 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'donation-delete-failed',
        message: error.message || '희망 기부 물품 삭제 중 오류가 발생했습니다.'
      }
    };
  }
};

// 희망 기부 물품과 매칭되는 구호품 요청 조회
export const getMatchingReliefRequests = async (userId) => {
  try {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }

    // 사용자 희망 기부 물품 목록 조회
    const donationsResult = await getUserDonationItems(userId);
    if (!donationsResult.success) {
      throw new Error('희망 기부 물품 목록을 불러올 수 없습니다.');
    }

    const userDonations = donationsResult.donations;
    if (userDonations.length === 0) {
      return {
        success: true,
        requests: [],
        userDonations: []
      };
    }

    // 모든 구호품 요청 조회
    const requestsResult = await getAllReliefRequests();
    if (!requestsResult.success) {
      throw new Error('구호품 요청 목록을 불러올 수 없습니다.');
    }
    
    console.log('📦 전체 구호품 요청 수:', requestsResult.requests?.length || 0);

    // 매칭 로직: 사용자 희망 기부 물품과 구호품 요청의 물품명이 일치하는 경우
    const matchingRequests = requestsResult.requests.filter(request => {
      return userDonations.some(donation => 
        donation.item_name.toLowerCase().includes(request.item_name.toLowerCase()) ||
        request.item_name.toLowerCase().includes(donation.item_name.toLowerCase())
      );
    });

    return {
      success: true,
      requests: matchingRequests,
      userDonations: userDonations
    };
  } catch (error) {
    console.error('매칭 구호품 요청 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'matching-requests-failed',
        message: error.message || '매칭 구호품 요청을 불러오는 중 오류가 발생했습니다.'
      }
    };
  }
};

// 송장번호 등록 서비스
export const updateSupplyTracking = async (supplyId, trackingData) => {
  try {
    const { courierCompany, trackingNumber } = trackingData;
    
    if (!supplyId || !courierCompany || !trackingNumber) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    const supplyRef = doc(db, 'relief_supplies', supplyId);
    
    await updateDoc(supplyRef, {
      courier_company: courierCompany,
      tracking_number: trackingNumber,
      status: 'shipped', // 배송 중 상태로 변경
      shipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('송장번호 등록 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'tracking-update-failed',
        message: error.message || '송장번호 등록 중 오류가 발생했습니다.'
      }
    };
  }
}; 