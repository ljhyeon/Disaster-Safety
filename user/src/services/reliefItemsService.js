// 구호품 아이템 마스터 데이터 관리 서비스 (Realtime Database)
import { ref, set, get, push, update, remove, onValue, off } from 'firebase/database';
import { realtimeDb } from './firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

// Realtime Database 경로 상수
const ITEMS_PATH = 'relief_items';
const CATEGORIES_PATH = 'relief_categories';
const RECENT_ITEMS_PATH = 'recent_relief_items';

// 구호품 아이템 구조
// relief_items/
//   ├── 식량/
//   │   ├── 즉석식품/
//   │   │   ├── {itemId}: { name: "컵라면", unit: "개", popularity: 10 }
//   │   ├── 음료/
//   │   │   ├── {itemId}: { name: "핫초코믹스", unit: "개", popularity: 5 }

// 카테고리 구조 초기화
export const initializeCategoriesStructure = async () => {
  const categoriesRef = ref(realtimeDb, CATEGORIES_PATH);

  const categories = {
    식량: {
      subcategories: {
        즉석식품: { description: '바로 먹을 수 있는 식품' },
        통조림: { description: '장기 보관 가능한 통조림' },
        음료: { description: '물, 음료수 등' },
        간식류: { description: '과자, 초콜릿 등' }
      }
    },
    생활용품: {
      subcategories: {
        위생용품: { description: '칫솔, 비누, 샴푸 등' },
        여성용품: { description: '생리대 등' },
        '세탁/청소': { description: '세제, 청소용품' },
        일상용품: { description: '휴지, 수건 등' }
      }
    },
    의약품: {
      subcategories: {
        일반의약품: { description: '진통제, 감기약 등' },
        구급용품: { description: '밴드, 소독약 등' },
        마스크류: { description: '마스크, 손소독제' },
        건강보조식품: { description: '비타민 등' }
      }
    },
    의류: {
      subcategories: {
        방한용품: { description: '담요, 침낭 등' },
        의류: { description: '옷, 속옷' },
        속옷: { description: '속옷류' },
        신발류: { description: '신발, 슬리퍼' }
      }
    },
    '유아·아동용품': {
      subcategories: {
        유아식: { description: '분유, 이유식' },
        위생용품: { description: '기저귀, 물티슈' },
        놀이용품: { description: '장난감, 도서' },
        아동복: { description: '아동 의류' }
      }
    },
    기타: {
      subcategories: {
        직접입력: { description: '기타 물품' }
      }
    }
  };

  try {
    await set(categoriesRef, categories);
    console.log('카테고리 구조 초기화 완료');
    return { success: true };
  } catch (error) {
    console.error('카테고리 초기화 실패:', error);
    return { success: false, error };
  }
};

// relief_requests에서 아이템 데이터 추출 및 마이그레이션
export const migrateItemsFromFirestore = async () => {
  try {
    // Firestore에서 모든 relief_requests 가져오기
    const requestsSnapshot = await getDocs(collection(db, 'relief_requests'));
    const itemsMap = new Map();

    requestsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.relief_items && Array.isArray(data.relief_items)) {
        data.relief_items.forEach(item => {
          const key = `${item.category}/${item.subcategory}/${item.item}`;

          if (!itemsMap.has(key)) {
            itemsMap.set(key, {
              name: item.item,
              category: item.category,
              subcategory: item.subcategory,
              unit: item.unit || '개',
              popularity: 1
            });
          } else {
            // 인기도 증가
            const existing = itemsMap.get(key);
            existing.popularity += 1;
            itemsMap.set(key, existing);
          }
        });
      }
    });

    // Realtime Database에 저장
    const updates = {};
    itemsMap.forEach((item, key) => {
      const [category, subcategory, name] = key.split('/');
      const itemRef = `${ITEMS_PATH}/${category}/${subcategory}/${name.replace(/\./g, '_')}`;
      updates[itemRef] = item;
    });

    await update(ref(realtimeDb), updates);

    console.log(`${itemsMap.size}개 아이템 마이그레이션 완료`);
    return { success: true, count: itemsMap.size };
  } catch (error) {
    console.error('아이템 마이그레이션 실패:', error);
    return { success: false, error };
  }
};

// 구호품 아이템 추가
export const addReliefItem = async (category, subcategory, itemData) => {
  try {
    const itemName = itemData.name.replace(/\./g, '_');
    const itemRef = ref(realtimeDb, `${ITEMS_PATH}/${category}/${subcategory}/${itemName}`);

    const item = {
      name: itemData.name,
      unit: itemData.unit || '개',
      popularity: 0,
      addedAt: new Date().toISOString(),
      ...itemData
    };

    await set(itemRef, item);

    // 최근 추가 아이템 업데이트
    await addToRecentItems(category, subcategory, item);

    return { success: true, item };
  } catch (error) {
    console.error('아이템 추가 실패:', error);
    return { success: false, error };
  }
};

// 최근 추가 아이템 관리
const addToRecentItems = async (category, subcategory, item) => {
  const recentRef = ref(realtimeDb, RECENT_ITEMS_PATH);
  const snapshot = await get(recentRef);

  let recentItems = snapshot.val() || [];

  // 배열이 아닌 경우 초기화
  if (!Array.isArray(recentItems)) {
    recentItems = [];
  }

  // 새 아이템 추가
  recentItems.unshift({
    ...item,
    category,
    subcategory,
    timestamp: Date.now()
  });

  // 최근 20개만 유지
  recentItems = recentItems.slice(0, 20);

  await set(recentRef, recentItems);
};

// 카테고리별 아이템 조회
export const getItemsByCategory = async (category, subcategory = null) => {
  try {
    const path = subcategory
      ? `${ITEMS_PATH}/${category}/${subcategory}`
      : `${ITEMS_PATH}/${category}`;

    const itemsRef = ref(realtimeDb, path);
    const snapshot = await get(itemsRef);

    if (!snapshot.exists()) {
      return { success: true, items: [] };
    }

    const data = snapshot.val();
    const items = [];

    // 데이터 평탄화
    const processItems = (obj, cat, subcat) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value.name) {
          items.push({
            id: key,
            category: cat,
            subcategory: subcat,
            ...value
          });
        } else if (typeof value === 'object') {
          // 서브카테고리인 경우 재귀 처리
          processItems(value, cat || category, key);
        }
      });
    };

    if (subcategory) {
      processItems(data, category, subcategory);
    } else {
      processItems(data, category);
    }

    // 인기도순 정렬
    items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return { success: true, items };
  } catch (error) {
    console.error('아이템 조회 실패:', error);
    return { success: false, error, items: [] };
  }
};

// 아이템 검색 (자동완성용)
export const searchItems = async (query) => {
  try {
    if (!query || query.length < 1) {
      return { success: true, results: [] };
    }

    const itemsRef = ref(realtimeDb, ITEMS_PATH);
    const snapshot = await get(itemsRef);

    if (!snapshot.exists()) {
      return { success: true, results: [] };
    }

    const data = snapshot.val();
    const results = [];
    const lowerQuery = query.toLowerCase();

    // 재귀적으로 모든 아이템 검색
    const searchInCategory = (category, categoryData) => {
      Object.entries(categoryData).forEach(([subcategory, subcategoryData]) => {
        if (typeof subcategoryData === 'object') {
          Object.entries(subcategoryData).forEach(([itemKey, itemData]) => {
            if (itemData.name && itemData.name.toLowerCase().includes(lowerQuery)) {
              results.push({
                id: itemKey,
                category,
                subcategory,
                ...itemData,
                matchScore: calculateMatchScore(itemData.name, query)
              });
            }
          });
        }
      });
    };

    Object.entries(data).forEach(([category, categoryData]) => {
      searchInCategory(category, categoryData);
    });

    // 매치 점수와 인기도로 정렬
    results.sort((a, b) => {
      const scoreDiff = b.matchScore - a.matchScore;
      if (scoreDiff !== 0) return scoreDiff;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return { success: true, results: results.slice(0, 10) }; // 상위 10개만 반환
  } catch (error) {
    console.error('아이템 검색 실패:', error);
    return { success: false, error, results: [] };
  }
};

// 매치 점수 계산
const calculateMatchScore = (itemName, query) => {
  const lowerItem = itemName.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerItem === lowerQuery) return 100;
  if (lowerItem.startsWith(lowerQuery)) return 80;
  if (lowerItem.includes(lowerQuery)) return 60;

  // 부분 매치
  const itemWords = lowerItem.split(/\s+/);
  const queryWords = lowerQuery.split(/\s+/);

  let matchCount = 0;
  queryWords.forEach(qWord => {
    if (itemWords.some(iWord => iWord.includes(qWord))) {
      matchCount++;
    }
  });

  return (matchCount / queryWords.length) * 40;
};

// 아이템 인기도 업데이트
export const updateItemPopularity = async (category, subcategory, itemName) => {
  try {
    const itemKey = itemName.replace(/\./g, '_');
    const itemRef = ref(realtimeDb, `${ITEMS_PATH}/${category}/${subcategory}/${itemKey}`);

    const snapshot = await get(itemRef);
    if (snapshot.exists()) {
      const currentPopularity = snapshot.val().popularity || 0;
      await update(itemRef, { popularity: currentPopularity + 1 });
    }

    return { success: true };
  } catch (error) {
    console.error('인기도 업데이트 실패:', error);
    return { success: false, error };
  }
};

// 최근 사용 아이템 조회
export const getRecentItems = async () => {
  try {
    const recentRef = ref(realtimeDb, RECENT_ITEMS_PATH);
    const snapshot = await get(recentRef);

    if (!snapshot.exists()) {
      return { success: true, items: [] };
    }

    const items = snapshot.val();
    return { success: true, items: Array.isArray(items) ? items : [] };
  } catch (error) {
    console.error('최근 아이템 조회 실패:', error);
    return { success: false, error, items: [] };
  }
};

// 실시간 아이템 업데이트 구독
export const subscribeToItems = (category, subcategory, callback) => {
  const path = subcategory
    ? `${ITEMS_PATH}/${category}/${subcategory}`
    : `${ITEMS_PATH}/${category}`;

  const itemsRef = ref(realtimeDb, path);

  const unsubscribe = onValue(itemsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  return unsubscribe;
};

// 인기 아이템 조회
export const getPopularItems = async (limit = 10) => {
  try {
    const itemsRef = ref(realtimeDb, ITEMS_PATH);
    const snapshot = await get(itemsRef);

    if (!snapshot.exists()) {
      return { success: true, items: [] };
    }

    const data = snapshot.val();
    const allItems = [];

    // 모든 아이템 수집
    const collectItems = (category, categoryData) => {
      Object.entries(categoryData).forEach(([subcategory, subcategoryData]) => {
        if (typeof subcategoryData === 'object') {
          Object.entries(subcategoryData).forEach(([itemKey, itemData]) => {
            if (itemData.name) {
              allItems.push({
                id: itemKey,
                category,
                subcategory,
                ...itemData
              });
            }
          });
        }
      });
    };

    Object.entries(data).forEach(([category, categoryData]) => {
      collectItems(category, categoryData);
    });

    // 인기도순 정렬 후 상위 N개 반환
    allItems.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return { success: true, items: allItems.slice(0, limit) };
  } catch (error) {
    console.error('인기 아이템 조회 실패:', error);
    return { success: false, error, items: [] };
  }
};

export default {
  initializeCategoriesStructure,
  migrateItemsFromFirestore,
  addReliefItem,
  getItemsByCategory,
  searchItems,
  updateItemPopularity,
  getRecentItems,
  getPopularItems,
  subscribeToItems
};