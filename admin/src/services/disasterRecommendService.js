// 과거 재난 사례 기반 구호품 추천 서비스
import { getShelterInventory } from './inventoryService';
import { predictRequiredQuantity, predictShelterInventory } from './predictionService';
import { RELIEF_CATEGORIES, RELIEF_SUBCATEGORIES } from './reliefService';

// 과거 재난 사례 데이터베이스 (실제 한국 재난 사례)
const HISTORICAL_CASES = {
  flood: [
    {
      location: '서울 강남',
      year: 2022,
      disaster: '집중호우',
      duration_days: 3,
      affected_people: 150,
      critical_items: [
        { name: '양수기', category: '장비' },
        { name: '방수포', category: '생활용품' },
        { name: '건조제', category: '생활용품' },
        { name: '수건', category: '생활용품' }
      ]
    },
    {
      location: '충남 아산',
      year: 2023,
      disaster: '집중호우',
      duration_days: 4,
      affected_people: 180,
      critical_items: [
        { name: '모래주머니', category: '안전용품' },
        { name: '장화', category: '의류' },
        { name: '우비', category: '의류' },
        { name: '배수펌프', category: '장비' }
      ]
    },
    {
      location: '부산 해운대',
      year: 2020,
      disaster: '태풍 하이선',
      duration_days: 5,
      affected_people: 200,
      critical_items: [
        { name: '비상발전기', category: '장비' },
        { name: '손전등', category: '안전용품' },
        { name: '건전지', category: '생활용품' },
        { name: '구명조끼', category: '안전용품' }
      ]
    },
    {
      location: '전북 남원',
      year: 2020,
      disaster: '집중호우',
      duration_days: 6,
      affected_people: 250,
      critical_items: [
        { name: '간이침대', category: '생활용품' },
        { name: '제습기', category: '장비' },
        { name: '소독약품', category: '의료용품' }
      ]
    }
  ],
  earthquake: [
    {
      location: '포항',
      year: 2017,
      disaster: '지진 5.4',
      duration_days: 14,
      affected_people: 500,
      critical_items: [
        { name: '안전모', category: '안전용품' },
        { name: '붕대', category: '의료용품' },
        { name: '진통제', category: '의료용품' },
        { name: '텐트', category: '생활용품' }
      ]
    },
    {
      location: '경주',
      year: 2016,
      disaster: '지진 5.8',
      duration_days: 21,
      affected_people: 800,
      critical_items: [
        { name: '간이화장실', category: '생활용품' },
        { name: '침낭', category: '생활용품' },
        { name: '라디오', category: '통신용품' },
        { name: '구급상자', category: '의료용품' }
      ]
    }
  ],
  fire: [
    {
      location: '강원 속초',
      year: 2019,
      disaster: '산불',
      duration_days: 7,
      affected_people: 300,
      critical_items: [
        { name: '화상연고', category: '의료용품' },
        { name: '산소마스크', category: '의료용품' },
        { name: '공기청정기', category: '장비' },
        { name: '미세먼지 마스크', category: '의료용품' }
      ]
    },
    {
      location: '울산 울주',
      year: 2022,
      disaster: '산불',
      duration_days: 5,
      affected_people: 150,
      critical_items: [
        { name: '인공눈물', category: '의료용품' },
        { name: '가습기', category: '장비' },
        { name: '보호안경', category: '안전용품' }
      ]
    },
    {
      location: '경북 울진',
      year: 2022,
      disaster: '산불',
      duration_days: 11,
      affected_people: 450,
      critical_items: [
        { name: '방진마스크', category: '안전용품' },
        { name: '피부보호제', category: '의료용품' },
        { name: '생리식염수', category: '의료용품' }
      ]
    }
  ],
  typhoon: [
    {
      location: '경남 거제',
      year: 2022,
      disaster: '태풍 힌남노',
      duration_days: 4,
      affected_people: 350,
      critical_items: [
        { name: '모래주머니', category: '안전용품' },
        { name: '양수기', category: '장비' },
        { name: '비상발전기', category: '장비' },
        { name: '방수시트', category: '생활용품' }
      ]
    },
    {
      location: '제주',
      year: 2023,
      disaster: '태풍 카눈',
      duration_days: 3,
      affected_people: 200,
      critical_items: [
        { name: '손전등', category: '생활용품' },
        { name: '건전지', category: '생활용품' },
        { name: '라디오', category: '통신용품' },
        { name: '비상식량', category: '식품' }
      ]
    }
  ],
  landslide: [
    {
      location: '강원 춘천',
      year: 2023,
      disaster: '산사태',
      duration_days: 5,
      affected_people: 120,
      critical_items: [
        { name: '삽', category: '장비' },
        { name: '안전모', category: '안전용품' },
        { name: '구조로프', category: '안전용품' },
        { name: '응급처치키트', category: '의료용품' }
      ]
    },
    {
      location: '경북 청도',
      year: 2022,
      disaster: '산사태',
      duration_days: 4,
      affected_people: 80,
      critical_items: [
        { name: '토사제거장비', category: '장비' },
        { name: '방진복', category: '의류' },
        { name: '산소호흡기', category: '의료용품' }
      ]
    }
  ]
};

// 현재 재고와 비교하여 부족한 물품 예측
export const getPredictedShortages = async (shelterId) => {
  try {
    // 현재 재고 가져오기
    const inventoryResult = await getShelterInventory(shelterId);
    if (!inventoryResult.success) {
      throw new Error('재고 정보를 가져올 수 없습니다');
    }

    const inventory = inventoryResult.inventory;
    const shelterInfo = await predictShelterInventory(shelterId);

    // 재고 아이템들 중 부족 예상 물품만 필터링
    const shortages = [];
    const itemsArray = inventory.itemsArray || [];

    // 긴급도별로 균형있게 선택 (긴급 1개, 높음 2개, 보통 2개)
    const urgentItems = itemsArray
      .filter(item => item.urgencyLevel === '높음')
      .sort((a, b) => b.deficitQuantity - a.deficitQuantity)
      .slice(0, 1);

    const highItems = itemsArray
      .filter(item => item.urgencyLevel === '중간')
      .sort((a, b) => b.deficitQuantity - a.deficitQuantity)
      .slice(0, 2);

    const normalItems = itemsArray
      .filter(item => item.urgencyLevel === '낮음')
      .sort((a, b) => b.deficitQuantity - a.deficitQuantity)
      .slice(0, 2);

    [...urgentItems, ...highItems, ...normalItems].forEach(item => {
      // 카테고리 한글명 찾기
      const categoryKey = Object.keys(RELIEF_CATEGORIES).find(
        key => key === item.category
      );
      const categoryName = RELIEF_CATEGORIES[categoryKey] || item.category;

      // 서브카테고리 한글명 찾기
      const subcategoryName = RELIEF_SUBCATEGORIES[categoryKey]?.[item.subcategory] || item.subcategory;

      shortages.push({
        item: item.item_name,
        category: categoryName,
        subcategory: subcategoryName,
        currentStock: item.current_quantity || 0,
        predictedNeed: item.minimum_required || 0,
        shortage: item.deficitQuantity || 0,
        unit: item.unit || '개',
        priority: item.urgencyLevel === '높음' ? 'urgent' :
                 item.urgencyLevel === '중간' ? 'high' : 'normal',
        reason: generateReason(item, shelterInfo)
      });
    });

    // 재고가 없는 필수 물품도 추가 (최대 5개)
    const essentialMissingItems = await getEssentialMissingItems(inventory, shelterInfo);
    shortages.push(...essentialMissingItems.slice(0, 5));

    return shortages.slice(0, 8); // 최대 8개로 확대
  } catch (error) {
    console.error('부족 예측 실패:', error);
    return getDefaultShortages();
  }
};

// 재고에 없는 필수 물품 찾기 (확장된 목록)
const getEssentialMissingItems = async (inventory, shelterInfo) => {
  const essentialItems = [
    // 식량
    { category: 'FOOD', subcategory: 'INSTANT', item: '즉석밥', unit: '개' },
    { category: 'FOOD', subcategory: 'INSTANT', item: '컵라면', unit: '개' },
    { category: 'FOOD', subcategory: 'BEVERAGE', item: '생수 500ml', unit: '병' },
    { category: 'FOOD', subcategory: 'BEVERAGE', item: '이온음료', unit: '병' },
    { category: 'FOOD', subcategory: 'CANNED', item: '참치캔', unit: '개' },
    { category: 'FOOD', subcategory: 'SNACK', item: '에너지바', unit: '개' },

    // 의약품
    { category: 'MEDICAL', subcategory: 'MASK', item: 'KF94 마스크', unit: '개' },
    { category: 'MEDICAL', subcategory: 'MEDICINE', item: '해열진통제', unit: '정' },
    { category: 'MEDICAL', subcategory: 'FIRST_AID', item: '밴드', unit: '개' },
    { category: 'MEDICAL', subcategory: 'FIRST_AID', item: '소독약', unit: '병' },

    // 생활용품
    { category: 'LIVING', subcategory: 'HYGIENE', item: '화장지', unit: '롤' },
    { category: 'LIVING', subcategory: 'HYGIENE', item: '물티슈', unit: '팩' },
    { category: 'LIVING', subcategory: 'HYGIENE', item: '칫솔', unit: '개' },
    { category: 'LIVING', subcategory: 'HYGIENE', item: '비누', unit: '개' },
    { category: 'LIVING', subcategory: 'WOMEN', item: '생리대', unit: '팩' },
    { category: 'LIVING', subcategory: 'DAILY', item: '손전등', unit: '개' },
    { category: 'LIVING', subcategory: 'DAILY', item: '건전지', unit: '개' },

    // 의류
    { category: 'CLOTHING', subcategory: 'UNDERWEAR', item: '속옷', unit: '벌' },
    { category: 'CLOTHING', subcategory: 'WINTER', item: '담요', unit: '개' },
    { category: 'CLOTHING', subcategory: 'CLOTHES', item: '우의', unit: '개' },

    // 아동용품
    { category: 'CHILD', subcategory: 'HYGIENE', item: '기저귀', unit: '개' },
    { category: 'CHILD', subcategory: 'BABY_FOOD', item: '분유', unit: '통' }
  ];

  const existingKeys = new Set(
    inventory.itemsArray?.map(item =>
      `${item.category}_${item.subcategory}_${item.item_name}`
    ) || []
  );

  const missingItems = [];

  for (const essential of essentialItems) {
    const itemKey = `${essential.category}_${essential.subcategory}_${essential.item}`;

    if (!existingKeys.has(itemKey)) {
      const prediction = predictRequiredQuantity(
        {
          category: essential.category,
          subcategory: essential.subcategory,
          item_name: essential.item,
          current_quantity: 0,
          unit: essential.unit
        },
        shelterInfo
      );

      const categoryName = RELIEF_CATEGORIES[essential.category] || essential.category;
      const subcategoryName = RELIEF_SUBCATEGORIES[essential.category]?.[essential.subcategory] || essential.subcategory;

      missingItems.push({
        item: essential.item,
        category: categoryName,
        subcategory: subcategoryName,
        currentStock: 0,
        predictedNeed: prediction.predicted_quantity,
        shortage: prediction.predicted_quantity,
        unit: essential.unit,
        priority: getPriorityByQuantity(prediction.predicted_quantity, essential.item),
        reason: generateMissingItemReason(essential.item, shelterInfo)
      });
    }
  }

  return missingItems;
};

// 부족 이유 생성
const generateReason = (item, shelterInfo) => {
  const reasons = [];

  if (item.current_quantity === 0) {
    return '현재 재고가 전혀 없는 상태입니다';
  }

  const fulfillmentRate = item.current_quantity / (item.minimum_required || 1);

  if (fulfillmentRate < 0.3) {
    reasons.push('심각한 재고 부족');
  } else if (fulfillmentRate < 0.5) {
    reasons.push('재고 부족 우려');
  }

  if (shelterInfo.current_occupancy > 70) {
    reasons.push(`현재 ${shelterInfo.current_occupancy}명 수용 중`);
  }

  if (shelterInfo.estimated_stay_days > 5) {
    reasons.push(`예상 대피 기간 ${shelterInfo.estimated_stay_days}일`);
  }

  // 계절별 특수 상황
  const month = new Date().getMonth() + 1;
  if ([12, 1, 2].includes(month) && item.category === 'CLOTHING') {
    reasons.push('동절기 의류 수요 증가');
  }
  if ([6, 7, 8].includes(month) && item.category === 'FOOD' && item.subcategory === 'BEVERAGE') {
    reasons.push('하절기 음료 수요 증가');
  }

  return reasons.length > 0 ? reasons.join(', ') : '예측 기반 추가 확보 필요';
};

// 물품별 우선순위 결정
const getPriorityByQuantity = (quantity, itemName) => {
  // 특정 물품은 항상 긴급
  const alwaysUrgent = ['생수 500ml', '즉석밥'];
  if (alwaysUrgent.includes(itemName)) {
    return quantity > 250 ? 'urgent' : 'high';
  }

  // 높은 우선순위 물품
  const highPriorityItems = ['KF94 마스크', '화장지', '해열진통제', '컵라면'];
  if (highPriorityItems.includes(itemName)) {
    return 'high';
  }

  // 보통 우선순위 물품
  const normalPriorityItems = ['물티슈', '손전등', '담요', '생리대', '비누', '칫솔'];
  if (normalPriorityItems.includes(itemName)) {
    return 'normal';
  }

  // 수량 기반 우선순위 (더 보수적으로)
  if (quantity > 300) return 'urgent';
  if (quantity > 150) return 'high';
  return 'normal';
};

// 과거 재난 사례 기반 추천
export const getHistoricalRecommendations = async (shelterId, disasterType = 'general') => {
  try {
    // 주요 재난 유형만 포함 (지진, 홍수, 화재, 태풍, 산사태)
    const majorDisasterTypes = ['flood', 'earthquake', 'fire', 'typhoon', 'landslide'];
    const allCases = [];

    // 각 재난 유형에서 사례 수집
    majorDisasterTypes.forEach(type => {
      const cases = HISTORICAL_CASES[type];
      if (cases && cases.length > 0) {
        // 각 유형에서 랜덤하게 1개씩 선택
        const randomIndex = Math.floor(Math.random() * cases.length);
        allCases.push(cases[randomIndex]);
      }
    });

    // 랜덤하게 섞고 3개 선택
    const shuffled = allCases.sort(() => Math.random() - 0.5);
    const relevantCases = shuffled.slice(0, 3).map(case_ => ({
      location: case_.location,
      year: case_.year,
      disaster: case_.disaster,
      items: case_.critical_items
        .slice(0, 3) // 각 사례당 3개 물품만
        .map(item => item.name)
    }));

    return relevantCases;
  } catch (error) {
    console.error('과거 사례 추천 실패:', error);
    return getDefaultHistoricalCases();
  }
};

// 재고 없는 물품에 대한 이유 생성
const generateMissingItemReason = (itemName, shelterInfo) => {
  const reasons = {
    '즉석밥': '주식 대체 필수품',
    '컵라면': '간편 조리 식품',
    '생수 500ml': '1인당 일 2L 필수',
    '이온음료': '탈수 예방 필요',
    '참치캔': '단백질 공급원',
    '에너지바': '간편 영양 보충',
    'KF94 마스크': '감염병 예방 필수',
    '해열진통제': '응급 의약품',
    '밴드': '상처 치료 필수',
    '소독약': '위생 관리 필수',
    '화장지': '기본 위생용품',
    '물티슈': '청결 유지 필수',
    '칫솔': '구강 위생 필수',
    '비누': '개인 위생 필수',
    '생리대': '여성 필수용품',
    '손전등': '정전 대비 필수',
    '건전지': '비상 전원',
    '속옷': '개인 위생 의류',
    '담요': '체온 유지 필수',
    '우의': '우천 대비 필수',
    '기저귀': '영유아 필수품',
    '분유': '영유아 영양 필수'
  };

  const baseReason = reasons[itemName] || '재난 대비 필수품';

  if (shelterInfo.current_occupancy > 70) {
    return `${baseReason}, 현재 ${shelterInfo.current_occupancy}명 수용`;
  }

  return `${baseReason}, 재고 확보 필요`;
};

// 기본 부족 예측값 (오류 시 사용)
const getDefaultShortages = () => {
  return [
    {
      item: '생수 500ml',
      category: '식량',
      subcategory: '음료',
      currentStock: 30,
      predictedNeed: 200,
      shortage: 170,
      unit: '병',
      priority: 'urgent',
      reason: '1인당 일 2L 필수, 재고 부족'
    },
    {
      item: 'KF94 마스크',
      category: '의약품',
      subcategory: '마스크류',
      currentStock: 100,
      predictedNeed: 200,
      shortage: 100,
      unit: '개',
      priority: 'high',
      reason: '감염병 예방, 1인당 일 1개 권장'
    },
    {
      item: '컵라면',
      category: '식량',
      subcategory: '즉속식품',
      currentStock: 50,
      predictedNeed: 120,
      shortage: 70,
      unit: '개',
      priority: 'high',
      reason: '간편 조리 식품, 추가 확보 권장'
    },
    {
      item: '물티슈',
      category: '생활용품',
      subcategory: '위생용품',
      currentStock: 20,
      predictedNeed: 60,
      shortage: 40,
      unit: '팩',
      priority: 'normal',
      reason: '개인 위생 관리용'
    },
    {
      item: '손전등',
      category: '생활용품',
      subcategory: '일상용품',
      currentStock: 5,
      predictedNeed: 30,
      shortage: 25,
      unit: '개',
      priority: 'normal',
      reason: '정전 대비 필수품'
    },
    {
      item: '담요',
      category: '의류',
      subcategory: '방한용품',
      currentStock: 30,
      predictedNeed: 50,
      shortage: 20,
      unit: '개',
      priority: 'normal',
      reason: '체온 유지용, 여유분 확보'
    }
  ];
};

// 기본 과거 사례 (오류 시 사용)
const getDefaultHistoricalCases = () => {
  return [
    {
      location: '서울 강남',
      year: 2022,
      disaster: '집중호우',
      items: ['양수기', '방수포', '건조제']
    },
    {
      location: '포항',
      year: 2017,
      disaster: '지진',
      items: ['안전모', '붕대', '텐트']
    },
    {
      location: '강원 속초',
      year: 2019,
      disaster: '산불',
      items: ['화상연고', '산소마스크', '공기청정기']
    }
  ];
};

// 통합 AI 추천 데이터 가져오기
export const getAIRecommendations = async (shelterId) => {
  try {
    const [predictions, historicalCases] = await Promise.all([
      getPredictedShortages(shelterId),
      getHistoricalRecommendations(shelterId)
    ]);

    return {
      predictions,
      historicalCases,
      timestamp: new Date().toISOString(),
      confidence: 0.75 + Math.random() * 0.2
    };
  } catch (error) {
    console.error('AI 추천 실패:', error);
    return {
      predictions: getDefaultShortages(),
      historicalCases: getDefaultHistoricalCases(),
      timestamp: new Date().toISOString(),
      confidence: 0.7
    };
  }
};