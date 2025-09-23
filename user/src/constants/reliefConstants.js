// 구호품 관련 상수들
export const RELIEF_CATEGORIES = {
  FOOD: '식량',
  DAILY_NECESSITIES: '생활용품',
  MEDICINE: '의약품',
  CLOTHING: '의류',
  BABY_CHILD: '유아·아동용품',
  OTHER: '기타'
};

export const RELIEF_SUBCATEGORIES = {
  [RELIEF_CATEGORIES.FOOD]: [
    '즉석식품', '통조림', '생수', '우유', '빵', '과자', '라면', '쌀', '음료', '간식류', '기타 식품'
  ],
  [RELIEF_CATEGORIES.DAILY_NECESSITIES]: [
    '위생용품', '세면용품', '화장지', '수건', '담요', '베개', '생리용품', '여성용품', '세탁/청소', '일상용품', '전기/전자용품', '생활안전용품', '기타 생활용품'
  ],
  [RELIEF_CATEGORIES.MEDICINE]: [
    '해열제', '감기약', '소화제', '진통제', '연고', '반창고', '소독약', '일반의약품', '구급용품', '마스크류', '건강보조식품', '기타 의약품'
  ],
  [RELIEF_CATEGORIES.CLOTHING]: [
    '상의', '하의', '속옷', '양말', '신발', '외투', '잠옷', '방한용품', '의류', '신발류', '기타 의류'
  ],
  [RELIEF_CATEGORIES.BABY_CHILD]: [
    '기저귀', '분유', '이유식', '젖병', '유아용품', '아동의류', '장난감', '유아식', '놀이용품', '아동복', '기타 유아용품'
  ],
  [RELIEF_CATEGORIES.OTHER]: [
    '기타', '직접입력'
  ]
};

export const RELIEF_PRIORITY = {
  URGENT: '긴급',
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음'
};

export const RELIEF_UNITS = {
  PIECE: '개',
  PACK: '팩',
  BOX: '박스',
  KG: 'kg',
  G: 'g',
  LITER: 'L',
  ML: 'ml',
  BOTTLE: '병',
  CAN: '캔',
  BAG: '봉',
  SET: '세트',
  PAIR: '켤레',
  BUNDLE: '묶음',
  ROLL: '롤',
  SHEET: '장',
  EA: '매',
  CASE: '통',
  DOZEN: '다스',
  UNIT: '단위',
  BUNCH: '송이',
  STEM: '줄기',
  PILL: '알',
  DROP: '방울',
  PIECE_CLOTH: '벌',
  SACK: '자루',
  SLICE: '조각',
  PLATE: '판',
  PACK_CIGARETTE: '갑',
  BULK: '보루',
  CLUMP: '뭉치',
  PART: '쪽',
  WRAP: '포'
};

export const RELIEF_REQUEST_STATUS = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨'
};

export const RELIEF_SUPPLY_STATUS = {
  PENDING: '대기중',
  CONFIRMED: '확인됨',
  SHIPPED: '배송중',
  DELIVERED: '전달완료',
  CANCELLED: '취소됨'
};
