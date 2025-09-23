import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const createTestShippedSupply = async (shelterId) => {
  try {
    const testSupply = {
      supply_id: `SUP${Date.now()}`,
      shelter_id: shelterId,
      request_id: `REQ${Date.now()}`,
      supplier_name: '한국적십자사',
      supplier_contact: '010-1234-5678',
      tracking_number: `KR${Math.floor(Math.random() * 1000000000)}`,
      supplied_items: [
        {
          item: '생수 500ml',
          category: 'FOOD',
          subcategory: 'BEVERAGE',
          quantity: 100,
          unit: '개'
        },
        {
          item: '즉석밥',
          category: 'FOOD',
          subcategory: 'INSTANT',
          quantity: 50,
          unit: '개'
        },
        {
          item: '마스크',
          category: 'MEDICAL',
          subcategory: 'MASK',
          quantity: 200,
          unit: '개'
        }
      ],
      notes: '긴급 구호품 배송',
      status: 'shipped',
      total_items: 3,
      created_at: new Date().toISOString(),
      shipped_at: new Date().toISOString(),
      estimated_delivery: new Date().toISOString()
    };

    const supplyRef = doc(db, 'relief_supplies', testSupply.supply_id);
    await setDoc(supplyRef, testSupply);

    return {
      success: true,
      message: '테스트 배송 데이터가 생성되었습니다.',
      supply_id: testSupply.supply_id
    };
  } catch (error) {
    console.error('테스트 데이터 생성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createMultipleTestSupplies = async (shelterId, count = 3) => {
  try {
    const suppliers = ['한국적십자사', '굿네이버스', '월드비전', '유니세프', '희망브리지'];
    const itemSets = [
      [
        { item: '생수 2L', category: 'FOOD', subcategory: 'BEVERAGE', quantity: 50, unit: '병' },
        { item: '컵라면', category: 'FOOD', subcategory: 'INSTANT', quantity: 100, unit: '개' },
        { item: '비스킷', category: 'FOOD', subcategory: 'SNACK', quantity: 80, unit: '개' }
      ],
      [
        { item: '담요', category: 'CLOTHING', subcategory: 'WINTER', quantity: 30, unit: '개' },
        { item: '속옷 세트', category: 'CLOTHING', subcategory: 'UNDERWEAR', quantity: 40, unit: '세트' }
      ],
      [
        { item: '기저귀', category: 'CHILD', subcategory: 'HYGIENE', quantity: 20, unit: '팩' },
        { item: '분유', category: 'CHILD', subcategory: 'BABY_FOOD', quantity: 15, unit: '통' }
      ],
      [
        { item: '손소독제', category: 'MEDICAL', subcategory: 'FIRST_AID', quantity: 100, unit: '개' },
        { item: '마스크', category: 'MEDICAL', subcategory: 'MASK', quantity: 500, unit: '개' },
        { item: '밴드', category: 'MEDICAL', subcategory: 'FIRST_AID', quantity: 50, unit: '박스' }
      ],
      [
        { item: '생리대', category: 'LIVING', subcategory: 'WOMEN', quantity: 50, unit: '팩' },
        { item: '칫솔', category: 'LIVING', subcategory: 'HYGIENE', quantity: 100, unit: '개' },
        { item: '치약', category: 'LIVING', subcategory: 'HYGIENE', quantity: 50, unit: '개' }
      ]
    ];

    const results = [];

    for (let i = 0; i < count; i++) {
      const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const randomItems = itemSets[Math.floor(Math.random() * itemSets.length)];
      const supplyId = `SUP${Date.now()}${i}`;

      const testSupply = {
        supply_id: supplyId,
        shelter_id: shelterId,
        request_id: `REQ${Date.now()}${i}`,
        supplier_name: randomSupplier,
        supplier_contact: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        tracking_number: `KR${Math.floor(Math.random() * 1000000000)}`,
        supplied_items: randomItems,
        notes: `구호품 배송 ${i + 1}`,
        status: 'shipped',
        total_items: randomItems.length,
        created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        shipped_at: new Date().toISOString(),
        estimated_delivery: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
      };

      const supplyRef = doc(db, 'relief_supplies', supplyId);
      await setDoc(supplyRef, testSupply);
      results.push(supplyId);

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: true,
      message: `${count}개의 테스트 배송 데이터가 생성되었습니다.`,
      supply_ids: results
    };
  } catch (error) {
    console.error('테스트 데이터 생성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const cleanupTestData = async (shelterId) => {
  try {
    const q = query(
      collection(db, 'relief_supplies'),
      where('shelter_id', '==', shelterId)
    );

    const querySnapshot = await getDocs(q);
    let deletedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      await deleteDoc(doc(db, 'relief_supplies', docSnapshot.id));
      deletedCount++;
    }

    return {
      success: true,
      message: `${deletedCount}개의 테스트 데이터가 삭제되었습니다.`
    };
  } catch (error) {
    console.error('테스트 데이터 정리 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};