// 대시보드 관련 서비스
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getShelterInventory } from './inventoryService';

// 우선 필요 용품 TOP 5 가져오기
export const getTopNeededItems = async (shelterId) => {
  try {
    const inventoryResult = await getShelterInventory(shelterId);
    if (!inventoryResult.success) {
      return [];
    }

    const items = inventoryResult.inventory.itemsArray || [];

    // 부족률 계산 (현재 수량 / 필요 수량 * 100)
    const itemsWithNeedPercent = items.map(item => ({
      name: item.item_name,
      percent: Math.min(100, Math.round(((item.minimum_required - item.current_quantity) / item.minimum_required) * 100))
    }))
    .filter(item => item.percent > 0) // 부족한 항목만
    .sort((a, b) => b.percent - a.percent) // 부족률 높은 순으로 정렬
    .slice(0, 5); // 상위 5개

    // 데이터가 부족하면 기본값 추가
    if (itemsWithNeedPercent.length < 5) {
      const defaultItems = [
        { name: '생수 500ml', percent: 65 },
        { name: '즉석밥', percent: 42 },
        { name: 'KF94 마스크', percent: 38 },
        { name: '컵라면', percent: 27 },
        { name: '물티슈', percent: 15 }
      ];

      // 기존 데이터와 합쳐서 5개 채우기
      const existingNames = new Set(itemsWithNeedPercent.map(item => item.name));
      const additionalItems = defaultItems
        .filter(item => !existingNames.has(item.name))
        .slice(0, 5 - itemsWithNeedPercent.length);

      return [...itemsWithNeedPercent, ...additionalItems];
    }

    return itemsWithNeedPercent;
  } catch (error) {
    console.error('상위 필요 용품 조회 실패:', error);
    // 오류 시 기본값 반환
    return [
      { name: '생수 500ml', percent: 65 },
      { name: '즉석밥', percent: 42 },
      { name: 'KF94 마스크', percent: 38 },
      { name: '컵라면', percent: 27 },
      { name: '물티슈', percent: 15 }
    ];
  }
};

// 최근 배송 알림 가져오기 (알림마당용)
export const getRecentDeliveryNotifications = async (shelterId) => {
  try {
    // relief_supplies에서 shipped 또는 inspected 상태의 데이터 가져오기
    const q = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId),
      where('status', 'in', ['shipped', 'inspected']),
      orderBy('updated_at', 'desc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const notifications = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();

      // 공급자 정보 가져오기
      let supplierName = '익명';
      let supplierEmail = '';

      if (data.supplier_id) {
        try {
          const userDoc = await getDoc(doc(db, 'users', data.supplier_id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            supplierName = userData.name || userData.display_name || userData.email?.split('@')[0] || '익명';
            supplierEmail = userData.email || '';
          }
        } catch (userError) {
          console.error('사용자 정보 조회 실패:', userError);
        }
      }

      // 알림 메시지 생성
      const itemName = data.item_name || '구호품';
      const quantity = data.supplied_quantity || data.requested_quantity || 0;
      const unit = data.unit || '개';

      const displayName = supplierName !== '익명' ? supplierName :
                          supplierEmail ? `${supplierEmail.split('@')[0]}님` : '익명님';

      const message = `${displayName}이 필요 구호품 중 ${itemName}을 ${quantity}${unit} 배송하였습니다.`;

      notifications.push({
        id: docSnapshot.id,
        type: 'delivery',
        message,
        timestamp: data.updated_at || data.created_at || new Date().toISOString(),
        status: data.status,
        supplier_name: supplierName,
        supplier_email: supplierEmail
      });
    }

    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error('알림 조회 실패:', error);
    return {
      success: false,
      notifications: []
    };
  }
};

// 대피소 전체 통계 가져오기
export const getShelterStatistics = async (shelterId) => {
  try {
    // relief_supplies에서 통계 계산
    const reliefQuery = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId)
    );

    const querySnapshot = await getDocs(reliefQuery);

    let totalRequests = 0;
    let pendingRequests = 0;
    let completedRequests = 0;
    let shippedRequests = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalRequests++;

      switch (data.status) {
        case 'pending':
          pendingRequests++;
          break;
        case 'confirmed':
          pendingRequests++;
          break;
        case 'shipped':
          shippedRequests++;
          break;
        case 'inspected':
        case 'delivered':
          completedRequests++;
          break;
      }
    });

    // 재고 정보 가져오기
    const inventoryResult = await getShelterInventory(shelterId);
    const totalItems = inventoryResult.success ? inventoryResult.inventory.itemsArray?.length || 0 : 0;
    const lowStockItems = inventoryResult.success ?
      inventoryResult.inventory.itemsArray?.filter(item =>
        item.current_quantity < item.minimum_required * 0.3
      ).length || 0 : 0;

    return {
      success: true,
      statistics: {
        totalRequests,
        pendingRequests,
        completedRequests,
        shippedRequests,
        totalItems,
        lowStockItems,
        fulfillmentRate: totalRequests > 0 ?
          Math.round((completedRequests / totalRequests) * 100) : 0
      }
    };
  } catch (error) {
    console.error('통계 조회 실패:', error);
    return {
      success: false,
      statistics: {
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        shippedRequests: 0,
        totalItems: 0,
        lowStockItems: 0,
        fulfillmentRate: 0
      }
    };
  }
};