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
  addDoc,
  Timestamp,
  writeBatch,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { predictRequiredQuantity, predictShelterInventory } from './predictionService';

export const createShelterInventory = async (shelterId) => {
  try {
    const inventoryRef = doc(db, 'shelter_inventory', shelterId);
    const inventoryDoc = await getDoc(inventoryRef);

    if (!inventoryDoc.exists()) {
      const inventoryData = {
        shelter_id: shelterId,
        items: {},
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await setDoc(inventoryRef, inventoryData);

      return {
        success: true,
        message: '대피소 재고 초기화 완료',
        inventory: inventoryData
      };
    }

    return {
      success: true,
      message: '이미 재고가 초기화되어 있습니다',
      inventory: inventoryDoc.data()
    };
  } catch (error) {
    console.error('대피소 재고 초기화 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'inventory-init-failed',
        message: error.message || '대피소 재고 초기화 중 오류가 발생했습니다.'
      }
    };
  }
};

export const getShelterInventory = async (shelterId) => {
  try {
    const inventoryRef = doc(db, 'shelter_inventory', shelterId);
    const inventoryDoc = await getDoc(inventoryRef);

    if (!inventoryDoc.exists()) {
      const result = await createShelterInventory(shelterId);
      return result;
    }

    const inventoryData = inventoryDoc.data();

    // 대피소 정보 가져오기 (예측을 위해)
    const shelterInfo = await predictShelterInventory(shelterId);

    const itemsArray = await Promise.all(
      Object.entries(inventoryData.items || {}).map(async ([key, value]) => {
        // AI 예측 수량 계산
        const prediction = predictRequiredQuantity(
          {
            category: value.category,
            subcategory: value.subcategory,
            item_name: value.item_name,
            current_quantity: value.current_quantity,
            unit: value.unit
          },
          shelterInfo
        );

        // 예측된 값을 minimum_required로 사용
        const predictedRequired = prediction.predicted_quantity;

        return {
          key,
          ...value,
          minimum_required: predictedRequired,
          urgencyLevel: calculateUrgencyLevel(value.current_quantity, predictedRequired),
          deficitQuantity: Math.max(0, predictedRequired - (value.current_quantity || 0)),
          fulfillmentRate: predictedRequired > 0 ?
            Math.round((value.current_quantity / predictedRequired) * 100) + '%' : '100%',
          prediction_confidence: prediction.confidence_score,
          recommendation: prediction.recommendation
        };
      })
    );

    return {
      success: true,
      inventory: {
        ...inventoryData,
        itemsArray,
        shelterInfo
      }
    };
  } catch (error) {
    console.error('대피소 재고 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'inventory-fetch-failed',
        message: error.message || '대피소 재고 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

const calculateUrgencyLevel = (currentQuantity, minimumRequired) => {
  if (!minimumRequired || minimumRequired === 0) return '낮음';

  const ratio = currentQuantity / minimumRequired;

  if (ratio < 0.3) return '높음';
  if (ratio < 0.7) return '중간';
  return '낮음';
};

export const updateInventoryItem = async (shelterId, itemKey, updateData) => {
  try {
    const inventoryRef = doc(db, 'shelter_inventory', shelterId);
    const inventoryDoc = await getDoc(inventoryRef);

    if (!inventoryDoc.exists()) {
      throw new Error('대피소 재고가 존재하지 않습니다.');
    }

    const currentInventory = inventoryDoc.data();
    const currentItem = currentInventory.items[itemKey] || {};

    const updatedItem = {
      ...currentItem,
      ...updateData,
      last_updated: new Date().toISOString()
    };

    await updateDoc(inventoryRef, {
      [`items.${itemKey}`]: updatedItem,
      last_updated: new Date().toISOString()
    });

    const transactionDoc = {
      shelter_id: shelterId,
      item_key: itemKey,
      item_name: updatedItem.item_name,
      category: updatedItem.category,
      previous_quantity: currentItem.current_quantity || 0,
      new_quantity: updatedItem.current_quantity,
      change_quantity: (updatedItem.current_quantity || 0) - (currentItem.current_quantity || 0),
      transaction_type: 'manual_update',
      created_at: new Date().toISOString(),
      updated_by: updateData.updated_by || 'system'
    };

    await addDoc(collection(db, 'inventory_transactions'), transactionDoc);

    return {
      success: true,
      message: '재고 정보가 업데이트되었습니다.',
      updatedItem
    };
  } catch (error) {
    console.error('재고 항목 업데이트 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'inventory-update-failed',
        message: error.message || '재고 항목 업데이트 중 오류가 발생했습니다.'
      }
    };
  }
};

export const addInventoryItem = async (shelterId, itemData) => {
  try {
    const inventoryRef = doc(db, 'shelter_inventory', shelterId);
    const inventoryDoc = await getDoc(inventoryRef);

    if (!inventoryDoc.exists()) {
      await createShelterInventory(shelterId);
    }

    const itemKey = `${itemData.category}_${itemData.subcategory}_${itemData.item_name}`.replace(/\s+/g, '_');

    // AI 예측을 통한 최소 필요 수량 계산 (사용자가 입력하지 않은 경우)
    let minimumRequired = itemData.minimum_required;
    if (!minimumRequired || minimumRequired === 0) {
      const shelterInfo = await predictShelterInventory(shelterId);
      const prediction = predictRequiredQuantity(
        {
          category: itemData.category,
          subcategory: itemData.subcategory,
          item_name: itemData.item_name,
          current_quantity: itemData.current_quantity || 0,
          unit: itemData.unit
        },
        shelterInfo
      );
      minimumRequired = prediction.predicted_quantity;
    }

    const newItem = {
      item_name: itemData.item_name,
      category: itemData.category,
      subcategory: itemData.subcategory,
      unit: itemData.unit,
      current_quantity: itemData.current_quantity || 0,
      minimum_required: minimumRequired,
      maximum_capacity: itemData.maximum_capacity || null,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await updateDoc(inventoryRef, {
      [`items.${itemKey}`]: newItem,
      last_updated: new Date().toISOString()
    });

    const transactionDoc = {
      shelter_id: shelterId,
      item_key: itemKey,
      item_name: newItem.item_name,
      category: newItem.category,
      quantity: newItem.current_quantity,
      transaction_type: 'initial_add',
      created_at: new Date().toISOString()
    };

    await addDoc(collection(db, 'inventory_transactions'), transactionDoc);

    return {
      success: true,
      message: '새 재고 항목이 추가되었습니다.',
      item: newItem,
      itemKey
    };
  } catch (error) {
    console.error('재고 항목 추가 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'inventory-add-failed',
        message: error.message || '재고 항목 추가 중 오류가 발생했습니다.'
      }
    };
  }
};

export const processDeliveryInspection = async (deliveryData) => {
  try {
    const batch = writeBatch(db);

    const supplyRef = doc(db, 'relief_supplies', deliveryData.supply_id);
    const supplyDoc = await getDoc(supplyRef);

    if (!supplyDoc.exists()) {
      throw new Error('배송 정보를 찾을 수 없습니다.');
    }

    const supplyData = supplyDoc.data();
    const actualQuantity = deliveryData.inspection_results[0]?.actual_quantity || 0;

    batch.update(supplyRef, {
      status: 'inspected',
      inspection_status: 'completed',
      inspected_at: new Date().toISOString(),
      actual_quantity: actualQuantity,
      discrepancy: actualQuantity - (supplyData.supplied_quantity || supplyData.requested_quantity || 0),
      discrepancy_reason: deliveryData.inspection_results[0]?.discrepancy_reason || null
    });

    const inventoryRef = doc(db, 'shelter_inventory', supplyData.shelter_id);
    const inventoryDoc = await getDoc(inventoryRef);

    if (!inventoryDoc.exists()) {
      await createShelterInventory(supplyData.shelter_id);
    }

    const currentInventory = inventoryDoc.data() || { items: {} };
    const updatedItems = { ...currentInventory.items };

    const itemKey = `${supplyData.category}_${supplyData.subcategory}_${supplyData.item_name}`.replace(/\s+/g, '_');

    if (updatedItems[itemKey]) {
      updatedItems[itemKey].current_quantity =
        (updatedItems[itemKey].current_quantity || 0) + actualQuantity;
      updatedItems[itemKey].last_updated = new Date().toISOString();
    } else {
      updatedItems[itemKey] = {
        item_name: supplyData.item_name,
        category: supplyData.category,
        subcategory: supplyData.subcategory,
        unit: supplyData.unit,
        current_quantity: actualQuantity,
        minimum_required: 0,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    }

    const transactionDoc = {
      shelter_id: supplyData.shelter_id,
      supply_id: deliveryData.supply_id,
      request_id: supplyData.request_id,
      item_key: itemKey,
      item_name: supplyData.item_name,
      category: supplyData.category,
      subcategory: supplyData.subcategory,
      expected_quantity: supplyData.supplied_quantity || supplyData.requested_quantity || 0,
      actual_quantity: actualQuantity,
      discrepancy: actualQuantity - (supplyData.supplied_quantity || supplyData.requested_quantity || 0),
      discrepancy_reason: deliveryData.inspection_results[0]?.discrepancy_reason || null,
      transaction_type: 'delivery_inspection',
      created_at: new Date().toISOString()
    };

    const transactionRef = doc(collection(db, 'inventory_transactions'));
    batch.set(transactionRef, transactionDoc);

    batch.update(inventoryRef, {
      items: updatedItems,
      last_updated: new Date().toISOString()
    });

    await batch.commit();

    return {
      success: true,
      message: '배송 검수가 완료되고 재고가 업데이트되었습니다.'
    };
  } catch (error) {
    console.error('배송 검수 처리 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'inspection-process-failed',
        message: error.message || '배송 검수 처리 중 오류가 발생했습니다.'
      }
    };
  }
};

export const getInventoryTransactions = async (shelterId, limit = 50) => {
  try {
    const q = query(
      collection(db, 'inventory_transactions'),
      where('shelter_id', '==', shelterId)
    );

    const querySnapshot = await getDocs(q);
    const transactions = [];

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      success: true,
      transactions: transactions.slice(0, limit)
    };
  } catch (error) {
    console.error('재고 거래 내역 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'transactions-fetch-failed',
        message: error.message || '재고 거래 내역 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

export const getInventoryStatistics = async (shelterId) => {
  try {
    const inventoryResult = await getShelterInventory(shelterId);

    if (!inventoryResult.success) {
      return inventoryResult;
    }

    const inventory = inventoryResult.inventory;
    const items = inventory.itemsArray || [];

    const statistics = {
      total_items: items.length,
      critical_items: items.filter(item => item.urgencyLevel === '높음').length,
      warning_items: items.filter(item => item.urgencyLevel === '중간').length,
      sufficient_items: items.filter(item => item.urgencyLevel === '낮음').length,
      total_deficit: items.reduce((sum, item) => sum + item.deficitQuantity, 0),
      average_fulfillment_rate: items.length > 0 ?
        Math.round(items.reduce((sum, item) =>
          sum + parseInt(item.fulfillmentRate.replace('%', '')), 0) / items.length) : 0,
      last_updated: inventory.last_updated
    };

    const categoryStatistics = {};
    items.forEach(item => {
      if (!categoryStatistics[item.category]) {
        categoryStatistics[item.category] = {
          total_items: 0,
          current_quantity: 0,
          minimum_required: 0,
          deficit: 0
        };
      }

      categoryStatistics[item.category].total_items++;
      categoryStatistics[item.category].current_quantity += item.current_quantity || 0;
      categoryStatistics[item.category].minimum_required += item.minimum_required || 0;
      categoryStatistics[item.category].deficit += item.deficitQuantity || 0;
    });

    return {
      success: true,
      statistics,
      categoryStatistics
    };
  } catch (error) {
    console.error('재고 통계 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'statistics-fetch-failed',
        message: error.message || '재고 통계 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

export const autoUpdateShippedStatus = async (shelterId) => {
  try {
    const q = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    let updatedCount = 0;

    querySnapshot.forEach((doc) => {
      const supplyData = doc.data();

      const estimatedDeliveryDate = new Date(supplyData.estimated_delivery || supplyData.created_at);
      const now = new Date();

      if (now >= estimatedDeliveryDate) {
        batch.update(doc.ref, {
          status: 'shipped',
          shipped_at: new Date().toISOString(),
          auto_updated: true
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }

    return {
      success: true,
      message: `${updatedCount}개의 배송 상태가 자동으로 업데이트되었습니다.`,
      updatedCount
    };
  } catch (error) {
    console.error('배송 상태 자동 업데이트 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'auto-update-failed',
        message: error.message || '배송 상태 자동 업데이트 중 오류가 발생했습니다.'
      }
    };
  }
};

export const getShippedSuppliesForInspection = async (shelterId) => {
  try {
    // shipped 또는 inspected 상태의 모든 배송 가져오기
    const q = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId),
      where('status', 'in', ['shipped', 'inspected'])
    );

    const querySnapshot = await getDocs(q);
    const shippedSupplies = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();

      // 공급자 정보 가져오기
      let supplierName = data.supplier_name;
      if (!supplierName && data.supplier_id) {
        try {
          const userDoc = await getDoc(doc(db, 'users', data.supplier_id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            supplierName = userData.name || userData.displayName || userData.email || data.supplier_id;
          } else {
            supplierName = data.supplier_email || data.supplier_id;
          }
        } catch (error) {
          supplierName = data.supplier_email || data.supplier_id || '공급자';
        }
      }

      shippedSupplies.push({
        key: docSnapshot.id,
        supply_id: docSnapshot.id,
        tracking_number: data.tracking_number || 'N/A',
        trackingNumber: data.tracking_number || 'N/A', // Checking 모달용
        deliveryId: data.request_id || docSnapshot.id.slice(0, 8),
        delivery_completed_at: data.shipped_at ? new Date(data.shipped_at).toLocaleDateString('ko-KR') :
                               data.created_at ? new Date(data.created_at).toLocaleDateString('ko-KR') : '-',
        deliveryDate: data.shipped_at ? new Date(data.shipped_at).toLocaleDateString('ko-KR') :
                     data.created_at ? new Date(data.created_at).toLocaleDateString('ko-KR') : '-', // Checking 모달용
        supplier: supplierName || '공급자',
        courier_company: data.courier_company || '-',
        status: data.status === 'inspected' || data.inspection_status === 'completed' ? '검수완료' : '배송완료',
        matched_quantity: 1,
        total_quantity: data.supplied_quantity || data.requested_quantity || 0,
        checkStatus: data.inspection_status === 'completed' ? '검수완료' : '미검수',
        receiveStatus: data.inspection_status === 'completed' &&
                      data.actual_quantity !== data.supplied_quantity ? '불일치' : '일치',
        items: [{
          key: 'item1',
          name: data.item_name || '품목',
          category: data.category,
          subcategory: data.subcategory,
          expected: data.supplied_quantity || data.requested_quantity || 0,
          unit: data.unit || '개'
        }],
        inspection_status: data.inspection_status,
        actual_quantity: data.actual_quantity,
        supplied_quantity: data.supplied_quantity,
        requested_quantity: data.requested_quantity,
        supplier_message: data.supplier_message,
        priority: data.priority
      });
    }

    shippedSupplies.sort((a, b) => {
      const dateA = new Date(a.delivery_completed_at);
      const dateB = new Date(b.delivery_completed_at);
      return dateB - dateA;
    });

    return {
      success: true,
      supplies: shippedSupplies
    };
  } catch (error) {
    console.error('검수 대상 배송 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'shipped-supplies-fetch-failed',
        message: error.message || '검수 대상 배송 조회 중 오류가 발생했습니다.'
      }
    };
  }
};