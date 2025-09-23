// 구호품 관리 서비스 (user용)
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { RELIEF_CATEGORIES, RELIEF_SUBCATEGORIES, RELIEF_PRIORITY, RELIEF_UNITS, RELIEF_REQUEST_STATUS, RELIEF_SUPPLY_STATUS } from '../constants/reliefConstants';

// 유틸리티 함수들
const getShelterData = async (shelterId) => {
  if (!shelterId) return null;
  try {
    const shelterDoc = await getDoc(doc(db, 'shelters', shelterId));
    return shelterDoc.exists() ? shelterDoc.data() : null;
  } catch (error) {
    console.warn('대피소 정보 조회 실패:', error);
    return null;
  }
};

const processReliefItems = (reliefItems, defaultPriority = 'normal') => {
  if (!reliefItems || !Array.isArray(reliefItems)) return [];
  return reliefItems.map(item => ({
    item_name: item.item || item.item_name || '구호품',
    category: item.category || '기타',
    subcategory: item.subcategory || '기타',
    quantity: item.quantity || 0,
    unit: item.unit || '개',
    priority: item.priority || defaultPriority,
    notes: item.notes || ''
  }));
};

const processReliefRequest = async (requestData, docId) => {
  const shelterData = await getShelterData(requestData.shelter_id);
  const processedItems = processReliefItems(requestData.relief_items, requestData.priority);
  const firstItem = processedItems.length > 0 ? processedItems[0] : { item_name: '구호품', category: '기타', subcategory: '기타', quantity: 0, unit: '개', priority: 'normal' };
  return {
    id: docId,
    request_id: requestData.request_id || docId,
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
};

const createSupplyDocument = (requestData, supplyData) => {
  const firstItem = requestData.relief_items && requestData.relief_items.length > 0 ? requestData.relief_items[0] : {};
  return {
    request_id: supplyData.requestId,
    shelter_id: requestData.shelter_id,
    item_name: firstItem.item || firstItem.item_name || '구호품',
    category: firstItem.category || '기타',
    subcategory: firstItem.subcategory || '기타',
    requested_quantity: firstItem.quantity || 0,
    supplied_quantity: supplyData.quantity,
    unit: firstItem.unit || '개',
    priority: requestData.priority || firstItem.priority || 'normal',
    supplier_name: supplyData.supplierName,
    supplier_phone: supplyData.supplierPhone,
    supplier_email: supplyData.supplierEmail || '',
    supplier_message: supplyData.supplierMessage || '',
    supplier_id: supplyData.userId,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

const createSimpleSupplyDocument = (requestData, requestId, userId, itemData) => ({
  request_id: requestId,
  shelter_id: itemData.shelter_id || requestData.shelter_id,
  item_name: itemData.item_name,
  category: itemData.category,
  subcategory: itemData.subcategory,
  requested_quantity: itemData.requested_quantity || itemData.quantity,
  supplied_quantity: itemData.quantity,
  unit: itemData.unit,
  priority: itemData.priority,
  supplier_name: '',
  supplier_phone: '',
  supplier_email: '',
  supplier_message: itemData.notes || '',
  supplier_id: userId,
  status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const processSupplyData = async (supplyData, docId) => {
  const shelterData = await getShelterData(supplyData.shelter_id);
  return { id: docId, ...supplyData, shelter: shelterData };
};

const sortByCreatedAtDesc = (items) => items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

// 모든 구호품 요청 조회 (일반 사용자용)
export const getAllReliefRequests = async () => {
  try {
    const requests = await fetchAllReliefRequests();
    const processedRequests = await processAllRequests(requests);
    return { success: true, requests: processedRequests };
  } catch (error) {
    console.error('❌ 구호품 요청 목록 조회 실패:', error);
    return { success: true, requests: [] };
  }
};

const fetchAllReliefRequests = async () => {
  const q = query(
    collection(db, 'relief_requests'),
    where('status', '!=', 'fulfilled')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs;
};

const processAllRequests = async (docs) => {
  const requests = [];
  for (const docSnapshot of docs) {
    const requestData = docSnapshot.data();
    const processedRequest = await processReliefRequest(requestData, docSnapshot.id);
    requests.push(processedRequest);
  }
  return sortByCreatedAtDesc(requests);
};

// 구호품 공급 등록
export const addReliefSupply = async (supplyData) => {
  try {
    const validatedData = validateSupplyData(supplyData);
    const requestData = await fetchRequestData(validatedData.requestId);
    const supplyDoc = createSupplyDocument(requestData, validatedData);
    const docRef = await addDoc(collection(db, 'relief_supplies'), supplyDoc);
    return { success: true, supply_id: docRef.id, supply: supplyDoc };
  } catch (error) {
    console.error('구호품 공급 등록 실패:', error);
    return { success: false, error: { code: error.code || 'supply-creation-failed', message: error.message || '구호품 공급 등록 중 오류가 발생했습니다.' } };
  }
};

const validateSupplyData = (supplyData) => {
  const { requestId, supplierName, supplierPhone, supplierEmail, quantity, message: supplierMessage, userId } = supplyData;
  if (!requestId || !supplierName || !supplierPhone || !quantity || !userId) throw new Error('필수 필드가 누락되었습니다.');
  return { requestId, supplierName, supplierPhone, supplierEmail, quantity, supplierMessage, userId };
};

const fetchRequestData = async (requestId) => {
  const requestDoc = await getDoc(doc(db, 'relief_requests', requestId));
  if (!requestDoc.exists()) throw new Error('존재하지 않는 구호품 요청입니다.');
  return requestDoc.data();
};

// 간단한 구호품 공급 등록 (새로운 플로우용)
export const addReliefSupplySimple = async (requestId, userId, itemData) => {
  try {
    validateSimpleSupplyData(requestId, userId, itemData);
    const requestData = await fetchRequestData(requestId);
    const supplyDoc = createSimpleSupplyDocument(requestData, requestId, userId, itemData);
    const docRef = await addDoc(collection(db, 'relief_supplies'), supplyDoc);
    return { success: true, supply_id: docRef.id, supply: supplyDoc };
  } catch (error) {
    console.error('구호품 공급 등록 실패:', error);
    return { success: false, error: { code: error.code || 'supply-creation-failed', message: error.message || '구호품 공급 등록 중 오류가 발생했습니다.' } };
  }
};

const validateSimpleSupplyData = (requestId, userId, itemData) => {
  if (!requestId || !userId || !itemData) throw new Error('필수 필드가 누락되었습니다.');
};

// 사용자별 구호품 공급 이력 조회
export const getReliefSuppliesByUser = async (userId) => {
  try {
    const supplies = await fetchUserSupplies(userId);
    const processedSupplies = await processUserSupplies(supplies);
    return { success: true, supplies: processedSupplies };
  } catch (error) {
    console.error('사용자별 구호품 공급 이력 조회 실패:', error);
    return { success: false, error: { code: error.code || 'supplies-fetch-failed', message: error.message || '구호품 공급 이력을 불러오는 중 오류가 발생했습니다.' } };
  }
};

const fetchUserSupplies = async (userId) => {
  const q = query(collection(db, 'relief_supplies'), where('supplier_id', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs;
};

const processUserSupplies = async (docs) => {
  const supplies = [];
  for (const docSnapshot of docs) {
    const supplyData = docSnapshot.data();
    const processedSupply = await processSupplyData(supplyData, docSnapshot.id);
    supplies.push(processedSupply);
  }
  return sortByCreatedAtDesc(supplies);
};

// 구호품 공급 상태 업데이트
export const updateReliefSupplyStatus = async (supplyId, status) => {
  try {
    const supplyRef = doc(db, 'relief_supplies', supplyId);
    await updateDoc(supplyRef, { status: status, updated_at: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error('구호품 공급 상태 업데이트 실패:', error);
    return { success: false, error: { code: error.code || 'supply-update-failed', message: error.message || '구호품 공급 상태 업데이트 중 오류가 발생했습니다.' } };
  }
};

// 구호품 공급 취소
export const cancelReliefSupply = async (supplyId) => {
  try {
    return await updateReliefSupplyStatus(supplyId, RELIEF_SUPPLY_STATUS.CANCELLED);
  } catch (error) {
    console.error('구호품 공급 취소 실패:', error);
    return { success: false, error: { code: error.code || 'supply-cancel-failed', message: error.message || '구호품 공급 취소 중 오류가 발생했습니다.' } };
  }
};

// 대피소별 구호품 공급 현황 조회
export const getReliefSuppliesByShelter = async (shelterId) => {
  try {
    if (!shelterId) return { success: false, error: { code: 'missing-shelter-id', message: '대피소 ID가 필요합니다.' } };
    const supplies = await fetchShelterSupplies(shelterId);
    return { success: true, supplies: supplies };
  } catch (error) {
    console.error('대피소별 구호품 공급 현황 조회 실패:', error);
    return { success: false, error: { code: error.code || 'supplies-fetch-failed', message: error.message || '구호품 공급 현황을 불러오는 중 오류가 발생했습니다.' } };
  }
};

const fetchShelterSupplies = async (shelterId) => {
  const q = query(collection(db, 'relief_supplies'), where('shelter_id', '==', shelterId));
  const querySnapshot = await getDocs(q);
  const supplies = [];
  querySnapshot.forEach((doc) => supplies.push({ id: doc.id, ...doc.data() }));
  return sortByCreatedAtDesc(supplies);
};

// 구호품 공급 통계 조회
export const getReliefSupplyStatistics = async (shelterId = null) => {
  try {
    const supplies = await fetchSupplyStatistics(shelterId);
    const statistics = calculateSupplyStatistics(supplies);
    return { success: true, statistics: statistics };
  } catch (error) {
    console.error('구호품 공급 통계 조회 실패:', error);
    return { success: false, error: { code: error.code || 'statistics-fetch-failed', message: error.message || '구호품 공급 통계를 불러오는 중 오류가 발생했습니다.' } };
  }
};

const fetchSupplyStatistics = async (shelterId) => {
  let q;
  if (shelterId) q = query(collection(db, 'relief_supplies'), where('shelter_id', '==', shelterId));
  else q = query(collection(db, 'relief_supplies'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

const calculateSupplyStatistics = (supplies) => {
  const statistics = { total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0, by_category: {} };
  supplies.forEach((data) => {
    statistics.total++;
    switch (data.status) {
      case RELIEF_SUPPLY_STATUS.PENDING: statistics.pending++; break;
      case RELIEF_SUPPLY_STATUS.CONFIRMED: statistics.confirmed++; break;
      case RELIEF_SUPPLY_STATUS.DELIVERED: statistics.delivered++; break;
      case RELIEF_SUPPLY_STATUS.CANCELLED: statistics.cancelled++; break;
    }
    const category = data.category;
    if (!statistics.by_category[category]) statistics.by_category[category] = 0;
    statistics.by_category[category]++;
  });
  return statistics;
};

// 사용자 희망 기부 물품 관련 서비스 함수들
export const addUserDonationItem = async (userId, itemData) => {
  try {
    const { item, quantity, category, subcategory, unit } = itemData;
    if (!userId || !item || !quantity) throw new Error('필수 필드가 누락되었습니다.');

    // 카테고리 정보가 없으면 자동 매칭 (동적 import로 순환 참조 방지)
    let finalCategory = category;
    let finalSubcategory = subcategory;
    let finalUnit = unit || '개';

    if (!category || !subcategory) {
      const { matchCategory } = await import('./itemCategoryMatcher');
      const matched = matchCategory(item);
      finalCategory = category || matched.category;
      finalSubcategory = subcategory || matched.subcategory;
      finalUnit = unit || matched.unit;
    }

    const donationDoc = {
      user_id: userId,
      item_name: item,
      quantity: quantity,
      category: finalCategory,
      subcategory: finalSubcategory,
      unit: finalUnit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    };
    const docRef = await addDoc(collection(db, 'user_donations'), donationDoc);
    return { success: true, donation_id: docRef.id, donation: donationDoc };
  } catch (error) {
    console.error('희망 기부 물품 등록 실패:', error);
    return { success: false, error: { code: error.code || 'donation-creation-failed', message: error.message || '희망 기부 물품 등록 중 오류가 발생했습니다.' } };
  }
};

export const getUserDonationItems = async (userId) => {
  try {
    if (!userId) throw new Error('사용자 ID가 필요합니다.');
    const donations = await fetchUserDonations(userId);
    return { success: true, donations: donations };
  } catch (error) {
    console.error('희망 기부 물품 목록 조회 실패:', error);
    return { success: false, error: { code: error.code || 'donations-fetch-failed', message: error.message || '희망 기부 물품 목록을 불러오는 중 오류가 발생했습니다.' } };
  }
};

const fetchUserDonations = async (userId) => {
  // active와 inactive 모두 가져오되, quantity가 0보다 큰 것만
  const q = query(
    collection(db, 'user_donations'),
    where('user_id', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  const donations = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // quantity가 0보다 큰 것만 표시
    if (data.quantity > 0) {
      donations.push({ id: doc.id, ...data });
    }
  });
  return sortByCreatedAtDesc(donations);
};

export const updateUserDonationItem = async (donationId, updateData) => {
  try {
    if (!donationId) throw new Error('기부 물품 ID가 필요합니다.');
    const donationRef = doc(db, 'user_donations', donationId);

    await updateDoc(donationRef, {
      ...updateData,
      updated_at: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('희망 기부 물품 수정 실패:', error);
    return { success: false, error: { code: error.code || 'donation-update-failed', message: error.message || '희망 기부 물품 수정 중 오류가 발생했습니다.' } };
  }
};

export const deleteUserDonationItem = async (donationId) => {
  try {
    if (!donationId) throw new Error('기부 물품 ID가 필요합니다.');
    const donationRef = doc(db, 'user_donations', donationId);
    await deleteDoc(donationRef);
    return { success: true };
  } catch (error) {
    console.error('희망 기부 물품 삭제 실패:', error);
    return { success: false, error: { code: error.code || 'donation-delete-failed', message: error.message || '희망 기부 물품 삭제 중 오류가 발생했습니다.' } };
  }
};

export const getMatchingReliefRequests = async (userId) => {
  try {
    if (!userId) throw new Error('사용자 ID가 필요합니다.');
    const userDonations = await getUserDonationItems(userId);
    if (!userDonations.success) throw new Error('희망 기부 물품 목록을 불러올 수 없습니다.');
    if (userDonations.donations.length === 0) return { success: true, requests: [], userDonations: [] };
    const requestsResult = await getAllReliefRequests();
    if (!requestsResult.success) throw new Error('구호품 요청 목록을 불러올 수 없습니다.');
    const matchingRequests = findMatchingRequests(requestsResult.requests, userDonations.donations);
    return { success: true, requests: matchingRequests, userDonations: userDonations.donations };
  } catch (error) {
    console.error('매칭 구호품 요청 조회 실패:', error);
    return { success: false, error: { code: error.code || 'matching-requests-failed', message: error.message || '매칭 구호품 요청을 불러오는 중 오류가 발생했습니다.' } };
  }
};

const findMatchingRequests = (requests, donations) => requests.filter(request =>
  donations.some(donation =>
    donation.item_name.toLowerCase().includes(request.item_name.toLowerCase()) ||
    request.item_name.toLowerCase().includes(donation.item_name.toLowerCase())
  )
);

// 보유 물품 수량 차감 서비스
export const updateUserDonationQuantity = async (userId, itemName, quantityToDeduct) => {
  try {
    if (!userId || !itemName || !quantityToDeduct) throw new Error('필수 필드가 누락되었습니다.');

    // 사용자의 해당 물품 찾기 (수량이 0보다 큰 것)
    const q = query(
      collection(db, 'user_donations'),
      where('user_id', '==', userId),
      where('item_name', '==', itemName)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('매칭되는 기부 물품을 찾을 수 없습니다.');
      return { success: true }; // 물품이 없어도 성공으로 처리
    }

    // 수량이 0보다 큰 첫 번째 매칭 물품 찾기
    let donationDoc = null;
    for (const doc of querySnapshot.docs) {
      if (doc.data().quantity > 0) {
        donationDoc = doc;
        break;
      }
    }

    if (!donationDoc) {
      console.log('차감 가능한 기부 물품이 없습니다.');
      return { success: true };
    }
    const currentData = donationDoc.data();
    const newQuantity = Math.max(0, currentData.quantity - quantityToDeduct); // 음수 방지

    // 수량 업데이트 (status는 변경하지 않음)
    await updateDoc(doc(db, 'user_donations', donationDoc.id), {
      quantity: newQuantity,
      updated_at: new Date().toISOString()
    });

    return { success: true, newQuantity: Math.max(0, newQuantity) };
  } catch (error) {
    console.error('보유 물품 수량 업데이트 실패:', error);
    return { success: false, error: { code: error.code || 'quantity-update-failed', message: error.message || '보유 물품 수량 업데이트 중 오류가 발생했습니다.' } };
  }
};

// 송장번호 등록 서비스 (보유 물품 자동 차감 포함)
export const updateSupplyTracking = async (supplyId, trackingData) => {
  try {
    validateTrackingData(supplyId, trackingData);

    // 공급 정보 가져오기
    const supplyDoc = await getDoc(doc(db, 'relief_supplies', supplyId));
    if (!supplyDoc.exists()) throw new Error('공급 정보를 찾을 수 없습니다.');

    const supplyInfo = supplyDoc.data();

    // 송장번호 업데이트
    await updateSupplyWithTracking(supplyId, trackingData);

    // 보유 물품 차감 (supplier_id와 item_name으로 매칭)
    const quantityToDeduct = supplyInfo.supplied_quantity || supplyInfo.requested_quantity || 0;
    if (supplyInfo.supplier_id && supplyInfo.item_name && quantityToDeduct > 0) {
      await updateUserDonationQuantity(
        supplyInfo.supplier_id,
        supplyInfo.item_name,
        quantityToDeduct
      );
    }

    // 요청 수량 차감 (request_id로 매칭)
    if (supplyInfo.request_id && supplyInfo.supplied_quantity) {
      await updateRequestQuantity(supplyInfo.request_id, supplyInfo.supplied_quantity);
    }

    return { success: true };
  } catch (error) {
    console.error('송장번호 등록 실패:', error);
    return { success: false, error: { code: error.code || 'tracking-update-failed', message: error.message || '송장번호 등록 중 오류가 발생했습니다.' } };
  }
};

// 요청 수량 차감 서비스
const updateRequestQuantity = async (requestId, suppliedQuantity) => {
  try {
    const requestRef = doc(db, 'relief_requests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) return;

    const requestData = requestDoc.data();
    const currentQuantity = requestData.quantity || 0;
    const newQuantity = Math.max(0, currentQuantity - suppliedQuantity);

    if (newQuantity <= 0) {
      // 수량이 0이 되면 fulfilled 상태로 변경
      await updateDoc(requestRef, {
        quantity: 0,
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else {
      // 수량만 차감
      await updateDoc(requestRef, {
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      });
    }

    // relief_items 배열도 업데이트
    if (requestData.relief_items && requestData.relief_items.length > 0) {
      const updatedItems = requestData.relief_items.map(item => ({
        ...item,
        quantity: Math.max(0, (item.quantity || 0) - suppliedQuantity)
      }));

      await updateDoc(requestRef, {
        relief_items: updatedItems
      });
    }
  } catch (error) {
    console.error('요청 수량 업데이트 실패:', error);
  }
};

const validateTrackingData = (supplyId, trackingData) => {
  const { courierCompany, trackingNumber } = trackingData;
  if (!supplyId || !courierCompany || !trackingNumber) throw new Error('필수 필드가 누락되었습니다.');
};

const updateSupplyWithTracking = async (supplyId, trackingData) => {
  const { courierCompany, trackingNumber } = trackingData;
  const supplyRef = doc(db, 'relief_supplies', supplyId);
  await updateDoc(supplyRef, {
    courier_company: courierCompany,
    tracking_number: trackingNumber,
    status: 'shipped',
    shipped_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};
