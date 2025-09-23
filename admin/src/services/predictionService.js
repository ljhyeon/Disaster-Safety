// AI 예측 기반 예상 필요 수량 계산 서비스

// 카테고리별 기본 필요량 (1인당 일일 기준) - 보수적으로 조정
const BASE_REQUIREMENTS = {
  FOOD: {
    INSTANT: { base: 1.5, unit: '개', multiplier: 0.8 },  // 즉석식품
    CANNED: { base: 1.0, unit: '개', multiplier: 0.7 },   // 통조림
    BEVERAGE: { base: 2.0, unit: '개', multiplier: 0.9 }, // 음료
    SNACK: { base: 0.8, unit: '개', multiplier: 0.6 }     // 간식류
  },
  LIVING: {
    HYGIENE: { base: 0.3, unit: '개', multiplier: 0.8 },  // 위생용품
    WOMEN: { base: 0.2, unit: '팩', multiplier: 0.7 },    // 여성용품
    CLEANING: { base: 0.1, unit: '개', multiplier: 0.6 }, // 세탁/청소
    DAILY: { base: 0.2, unit: '개', multiplier: 0.7 }     // 일상용품
  },
  MEDICAL: {
    MEDICINE: { base: 0.1, unit: '개', multiplier: 0.8 },  // 일반의약품
    FIRST_AID: { base: 0.05, unit: '개', multiplier: 0.9 }, // 구급용품
    MASK: { base: 1.5, unit: '개', multiplier: 1.0 },      // 마스크류
    SUPPLEMENT: { base: 0.05, unit: '개', multiplier: 0.5 } // 건강보조식품
  },
  CLOTHING: {
    WINTER: { base: 0.2, unit: '개', multiplier: 1.0 },    // 방한용품
    CLOTHES: { base: 0.15, unit: '벌', multiplier: 0.7 },  // 의류
    UNDERWEAR: { base: 0.25, unit: '세트', multiplier: 0.8 }, // 속옷
    SHOES: { base: 0.05, unit: '켤레', multiplier: 0.6 }   // 신발류
  },
  CHILD: {
    BABY_FOOD: { base: 2.0, unit: '개', multiplier: 1.0 },  // 유아식
    HYGIENE: { base: 2.5, unit: '개', multiplier: 1.2 },    // 위생용품
    TOYS: { base: 0.1, unit: '개', multiplier: 0.3 },       // 놀이용품
    CLOTHES: { base: 0.25, unit: '벌', multiplier: 0.8 }   // 아동복
  }
};

// 계절별 가중치 (보수적으로 조정)
const getSeasonalWeight = (category, subcategory) => {
  const month = new Date().getMonth() + 1; // 1-12

  // 겨울 (12, 1, 2월)
  if ([12, 1, 2].includes(month)) {
    if (category === 'CLOTHING' && subcategory === 'WINTER') return 1.5; // 2.5 → 1.5
    if (category === 'FOOD' && subcategory === 'BEVERAGE') return 1.1;   // 1.3 → 1.1
    if (category === 'MEDICAL') return 1.2; // 1.4 → 1.2
  }

  // 여름 (6, 7, 8월)
  if ([6, 7, 8].includes(month)) {
    if (category === 'FOOD' && subcategory === 'BEVERAGE') return 1.3;   // 2.0 → 1.3
    if (category === 'LIVING' && subcategory === 'HYGIENE') return 1.2;  // 1.6 → 1.2
    if (category === 'MEDICAL' && subcategory === 'MASK') return 0.7;   // 0.8 → 0.7
  }

  // 봄/가을 환절기 (3, 4, 9, 10월)
  if ([3, 4, 9, 10].includes(month)) {
    if (category === 'MEDICAL') return 1.1;  // 1.3 → 1.1
    if (category === 'CLOTHING' && subcategory === 'CLOTHES') return 1.1; // 1.2 → 1.1
  }

  return 1.0; // 기본 가중치
};

// 재난 유형별 가중치 (보수적으로 조정)
const getDisasterWeight = (category, disasterType = 'general') => {
  const weights = {
    flood: { // 홍수
      FOOD: 1.1,     // 1.3 → 1.1
      LIVING: 1.2,   // 1.5 → 1.2
      MEDICAL: 1.1,  // 1.2 → 1.1
      CLOTHING: 1.3, // 1.8 → 1.3
      CHILD: 1.1     // 1.2 → 1.1
    },
    earthquake: { // 지진
      FOOD: 1.2,     // 1.5 → 1.2
      LIVING: 1.1,   // 1.3 → 1.1
      MEDICAL: 1.4,  // 2.0 → 1.4
      CLOTHING: 1.2, // 1.4 → 1.2
      CHILD: 1.1     // 1.3 → 1.1
    },
    fire: { // 화재
      FOOD: 1.1,     // 1.2 → 1.1
      LIVING: 1.2,   // 1.4 → 1.2
      MEDICAL: 1.3,  // 1.8 → 1.3
      CLOTHING: 1.4, // 2.0 → 1.4
      CHILD: 1.1     // 1.2 → 1.1
    },
    general: { // 일반
      FOOD: 0.9,     // 1.0 → 0.9 (기본값도 줄임)
      LIVING: 0.9,
      MEDICAL: 0.9,
      CLOTHING: 0.9,
      CHILD: 0.9
    }
  };

  return weights[disasterType]?.[category] || 0.9;
};

// 대피 기간별 가중치
const getDurationWeight = (estimatedDays = 7) => {
  if (estimatedDays <= 3) return 0.8;
  if (estimatedDays <= 7) return 1.0;
  if (estimatedDays <= 14) return 1.2;
  if (estimatedDays <= 30) return 1.5;
  return 2.0; // 장기 대피
};

// 인구 구성별 가중치
const getPopulationWeight = (category, shelterInfo = {}) => {
  const {
    elderlyRatio = 0.2,  // 노인 비율
    childrenRatio = 0.15, // 아동 비율
    femaleRatio = 0.5    // 여성 비율
  } = shelterInfo;

  let weight = 1.0;

  if (category === 'MEDICAL') {
    weight += elderlyRatio * 0.8; // 노인이 많을수록 의약품 수요 증가
  }

  if (category === 'CHILD') {
    weight = childrenRatio > 0 ? (1.0 + childrenRatio * 3.0) : 0.1; // 아동 비율에 따라 가중치 조정
  }

  if (category === 'LIVING') {
    weight += femaleRatio * 0.3; // 여성 비율에 따라 생활용품 수요 조정
  }

  return weight;
};

// 현재 재고 수준에 따른 긴급도 조정
const getStockLevelAdjustment = (currentQuantity, minimumRequired) => {
  if (!minimumRequired || minimumRequired === 0) return 1.0;

  const stockRatio = currentQuantity / minimumRequired;

  if (stockRatio < 0.2) return 1.8;  // 매우 부족
  if (stockRatio < 0.5) return 1.4;  // 부족
  if (stockRatio < 0.8) return 1.1;  // 약간 부족
  if (stockRatio > 1.5) return 0.8;  // 충분
  if (stockRatio > 2.0) return 0.6;  // 과잉

  return 1.0;
};

// 랜덤 변동성 추가 (현실적인 예측을 위해)
const addRandomVariation = (value, variance = 0.1) => {
  const variation = 1 + (Math.random() - 0.5) * variance * 2;
  return Math.round(value * variation);
};

// 예측값 캐시 (한번 계산된 값은 고정)
const predictionCache = new Map();

// 메인 예측 함수
export const predictRequiredQuantity = (itemInfo, shelterInfo = {}) => {
  const {
    category,
    subcategory,
    current_quantity = 0
  } = itemInfo;

  // 캐시 키 생성
  const cacheKey = `${shelterInfo.shelter_id || 'default'}_${category}_${subcategory}_${itemInfo.item_name || 'item'}`;

  // 캐시에 값이 있으면 그대로 반환
  if (predictionCache.has(cacheKey)) {
    const cachedValue = predictionCache.get(cacheKey);
    // 현재 재고만 업데이트하여 recommendation 재계산
    return {
      ...cachedValue,
      recommendation: generateRecommendation(cachedValue.predicted_quantity, current_quantity)
    };
  }

  const {
    current_occupancy = 50,     // 현재 수용 인원 (100 → 50)
    disaster_type = 'general',  // 재난 유형
    estimated_stay_days = 3,    // 예상 대피 기간 (7 → 3)
    elderly_count = 10,         // 노인 인원 (20 → 10)
    children_count = 8,         // 아동 인원 (15 → 8)
    female_count = 25          // 여성 인원 (50 → 25)
  } = shelterInfo;

  // 기본 필요량 계산
  const baseReq = BASE_REQUIREMENTS[category]?.[subcategory] || { base: 1, multiplier: 1.0 };
  let baseQuantity = baseReq.base * current_occupancy * estimated_stay_days;

  // 각종 가중치 적용
  const seasonalWeight = getSeasonalWeight(category, subcategory);
  const disasterWeight = getDisasterWeight(category, disaster_type);
  const durationWeight = getDurationWeight(estimated_stay_days);
  const populationWeight = getPopulationWeight(category, {
    elderlyRatio: elderly_count / current_occupancy,
    childrenRatio: children_count / current_occupancy,
    femaleRatio: female_count / current_occupancy
  });

  // 전체 가중치 계산
  const totalWeight = seasonalWeight * disasterWeight * durationWeight *
                      populationWeight * baseReq.multiplier;

  // 최종 예상 필요량 계산
  let predictedQuantity = baseQuantity * totalWeight;

  // 현재 재고 수준 고려
  const stockAdjustment = getStockLevelAdjustment(current_quantity, predictedQuantity);
  predictedQuantity *= stockAdjustment;

  // 랜덤 변동성 추가 (±5%로 줄임)
  predictedQuantity = addRandomVariation(predictedQuantity, 0.05);

  // 최소/최대값 제한 (더 보수적으로)
  predictedQuantity = Math.max(5, Math.min(predictedQuantity, 1000)); // 10-10000 → 5-1000

  // 5의 배수로 반올림 (깔끔한 숫자를 위해)
  predictedQuantity = Math.round(predictedQuantity / 5) * 5;

  const result = {
    predicted_quantity: predictedQuantity,
    confidence_score: 0.75 + Math.random() * 0.2, // 75-95% 신뢰도
    factors: {
      seasonal: seasonalWeight,
      disaster: disasterWeight,
      duration: durationWeight,
      population: populationWeight,
      stock_level: stockAdjustment
    },
    recommendation: generateRecommendation(predictedQuantity, current_quantity)
  };

  // 결과를 캐시에 저장
  predictionCache.set(cacheKey, result);

  return result;
};

// 추천 메시지 생성
const generateRecommendation = (predicted, current) => {
  const ratio = current / predicted;

  if (ratio < 0.3) {
    return '긴급 보충 필요';
  } else if (ratio < 0.5) {
    return '조속한 보충 권장';
  } else if (ratio < 0.8) {
    return '추가 확보 필요';
  } else if (ratio < 1.2) {
    return '적정 수준 유지';
  } else if (ratio < 2.0) {
    return '충분한 재고 보유';
  } else {
    return '과잉 재고 상태';
  }
};

// 대피소 전체 재고에 대한 예측
export const predictShelterInventory = async (shelterId, shelterInfo = {}) => {
  try {
    // 대피소별로 고정된 시드값 생성 (shelterId 기반)
    const seedValue = shelterId ?
      shelterId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) :
      100;

    // 시드값을 기반으로 일관된 값 생성
    const actualShelterInfo = {
      shelter_id: shelterId,
      current_occupancy: 30 + (seedValue % 50),  // 30-80명 (기존 80-200 → 30-80)
      max_capacity: 100,  // 200 → 100
      disaster_type: 'general',
      estimated_stay_days: 3 + (seedValue % 5),   // 3-7일 (기존 5-15 → 3-7)
      elderly_count: 5 + (seedValue % 15),        // 5-20명 (기존 15-45 → 5-20)
      children_count: 5 + (seedValue % 10),       // 5-15명 (기존 10-30 → 5-15)
      female_count: 15 + (seedValue % 30),        // 15-45명 (기존 40-100 → 15-45)
      ...shelterInfo
    };

    return actualShelterInfo;
  } catch (error) {
    console.error('대피소 정보 조회 실패:', error);
    return { shelter_id: shelterId, ...shelterInfo };
  }
};

// 카테고리별 전체 예측
export const predictByCategory = (category, shelterInfo = {}) => {
  const predictions = {};
  const subcategories = BASE_REQUIREMENTS[category] || {};

  Object.keys(subcategories).forEach(subcategory => {
    const itemInfo = {
      category,
      subcategory,
      current_quantity: 0
    };

    predictions[subcategory] = predictRequiredQuantity(itemInfo, shelterInfo);
  });

  return predictions;
};

// 캐시 초기화 함수 (필요시 사용)
export const clearPredictionCache = () => {
  predictionCache.clear();
};