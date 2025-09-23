// 사용자 기부 물품과 구호품 공급을 연결하는 서비스
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';

// 사용자의 기부 가능 물품을 relief_supplies로 변환하여 등록
export const convertDonationToSupply = async (userId, donationItem, targetShelterId) => {
  try {
    // user_donations의 데이터를 relief_supplies 형태로 변환
    const supplyDoc = {
      supply_id: `SUP${Date.now()}`,
      shelter_id: targetShelterId,
      request_id: null, // 직접 기부인 경우 null
      supplier_id: userId,
      supplier_name: donationItem.user_name || '익명',
      supplier_contact: donationItem.user_contact || '',
      supplied_items: [{
        category: donationItem.category,
        subcategory: donationItem.subcategory,
        item: donationItem.item_name,
        quantity: donationItem.quantity,
        unit: donationItem.unit || '개'
      }],
      notes: `사용자 보유 물품 기부`,
      status: 'pending', // 초기 상태는 pending
      total_items: 1,
      created_at: new Date().toISOString(),
      donation_ref_id: donationItem.id // 원본 donation 참조
    };

    const docRef = await addDoc(collection(db, 'relief_supplies'), supplyDoc);

    // 원본 donation 상태 업데이트
    if (donationItem.id) {
      await updateDoc(doc(db, 'user_donations', donationItem.id), {
        supply_status: 'matched',
        matched_shelter_id: targetShelterId,
        supply_ref_id: docRef.id,
        updated_at: new Date().toISOString()
      });
    }

    return { success: true, supply_id: docRef.id, supply: supplyDoc };
  } catch (error) {
    console.error('기부 물품 공급 변환 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'conversion-failed',
        message: error.message || '기부 물품 공급 변환 중 오류가 발생했습니다.'
      }
    };
  }
};

// 사용자의 기부 가능 물품과 매칭되는 구호품 요청 찾기
export const findMatchingRequests = async (userDonations) => {
  try {
    // 모든 pending 상태의 relief_requests 가져오기
    const q = query(
      collection(db, 'relief_requests'),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);

    const matchingRequests = [];

    querySnapshot.forEach((doc) => {
      const requestData = doc.data();

      // 사용자의 기부 물품과 매칭되는 요청 찾기
      userDonations.forEach(donation => {
        if (requestData.relief_items && Array.isArray(requestData.relief_items)) {
          requestData.relief_items.forEach(requestItem => {
            // 카테고리와 서브카테고리가 일치하는 경우
            if (requestItem.category === donation.category &&
                requestItem.subcategory === donation.subcategory) {
              matchingRequests.push({
                request: { id: doc.id, ...requestData },
                donation: donation,
                matchedItem: requestItem,
                matchScore: calculateMatchScore(donation, requestItem)
              });
            }
          });
        }
      });
    });

    // 매칭 점수로 정렬 (높은 점수 우선)
    matchingRequests.sort((a, b) => b.matchScore - a.matchScore);

    return { success: true, matches: matchingRequests };
  } catch (error) {
    console.error('매칭 요청 찾기 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'matching-failed',
        message: error.message || '매칭 요청을 찾는 중 오류가 발생했습니다.'
      }
    };
  }
};

// 매칭 점수 계산 (우선순위, 수량 등 고려)
const calculateMatchScore = (donation, requestItem) => {
  let score = 0;

  // 카테고리 일치 점수
  if (donation.category === requestItem.category) score += 10;
  if (donation.subcategory === requestItem.subcategory) score += 20;

  // 물품명 유사도
  if (donation.item_name && requestItem.item) {
    const similarity = calculateSimilarity(donation.item_name, requestItem.item);
    score += similarity * 30;
  }

  // 수량 충족도
  if (donation.quantity >= requestItem.quantity) {
    score += 15; // 전체 수량 충족
  } else {
    score += (donation.quantity / requestItem.quantity) * 10; // 부분 충족
  }

  // 우선순위 가중치
  switch (requestItem.priority) {
    case 'urgent': score += 25; break;
    case 'high': score += 15; break;
    case 'normal': score += 5; break;
    default: break;
  }

  return score;
};

// 문자열 유사도 계산 (간단한 버전)
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // 공통 단어 비율 계산
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));

  return commonWords.length / Math.max(words1.length, words2.length);
};

// 사용자 기부 물품의 공급 상태 동기화
export const syncDonationSupplyStatus = async (userId) => {
  try {
    // 사용자의 모든 active donation 가져오기
    const donationsQuery = query(
      collection(db, 'user_donations'),
      where('user_id', '==', userId),
      where('status', '==', 'active')
    );
    const donationsSnapshot = await getDocs(donationsQuery);

    const updates = [];

    for (const donationDoc of donationsSnapshot.docs) {
      const donationData = donationDoc.data();

      // 연결된 supply가 있는 경우 상태 확인
      if (donationData.supply_ref_id) {
        const supplyQuery = query(
          collection(db, 'relief_supplies'),
          where('donation_ref_id', '==', donationDoc.id)
        );
        const supplySnapshot = await getDocs(supplyQuery);

        if (!supplySnapshot.empty) {
          const supplyData = supplySnapshot.docs[0].data();

          // supply 상태에 따라 donation 상태 업데이트
          if (supplyData.status === 'delivered') {
            updates.push(
              updateDoc(doc(db, 'user_donations', donationDoc.id), {
                status: 'completed',
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            );
          }
        }
      }
    }

    await Promise.all(updates);

    return { success: true, updatedCount: updates.length };
  } catch (error) {
    console.error('기부 물품 상태 동기화 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'sync-failed',
        message: error.message || '상태 동기화 중 오류가 발생했습니다.'
      }
    };
  }
};

// 구호품 공급 현황 대시보드 데이터
export const getDonationSupplyDashboard = async (userId) => {
  try {
    // 사용자의 기부 물품 통계
    const donationsQuery = query(
      collection(db, 'user_donations'),
      where('user_id', '==', userId)
    );
    const donationsSnapshot = await getDocs(donationsQuery);

    const stats = {
      totalDonations: 0,
      activeDonations: 0,
      matchedDonations: 0,
      completedDonations: 0,
      byCategory: {},
      recentMatches: []
    };

    donationsSnapshot.forEach(doc => {
      const data = doc.data();
      stats.totalDonations++;

      switch (data.status) {
        case 'active': stats.activeDonations++; break;
        case 'matched': stats.matchedDonations++; break;
        case 'completed': stats.completedDonations++; break;
      }

      // 카테고리별 집계
      if (data.category) {
        if (!stats.byCategory[data.category]) {
          stats.byCategory[data.category] = { count: 0, quantity: 0 };
        }
        stats.byCategory[data.category].count++;
        stats.byCategory[data.category].quantity += data.quantity || 0;
      }
    });

    // 최근 매칭된 공급 기록 가져오기
    const suppliesQuery = query(
      collection(db, 'relief_supplies'),
      where('supplier_id', '==', userId)
    );
    const suppliesSnapshot = await getDocs(suppliesQuery);

    suppliesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.created_at) {
        stats.recentMatches.push({
          id: doc.id,
          ...data
        });
      }
    });

    // 최근 5개만 정렬해서 반환
    stats.recentMatches.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    ).slice(0, 5);

    return { success: true, dashboard: stats };
  } catch (error) {
    console.error('대시보드 데이터 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'dashboard-failed',
        message: error.message || '대시보드 데이터 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

export default {
  convertDonationToSupply,
  findMatchingRequests,
  syncDonationSupplyStatus,
  getDonationSupplyDashboard
};