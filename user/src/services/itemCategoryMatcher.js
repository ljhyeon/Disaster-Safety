// 물품명 기반 자동 카테고리 매칭 서비스
import { RELIEF_CATEGORIES, RELIEF_SUBCATEGORIES } from '../constants/reliefConstants';

// 키워드 기반 카테고리 매핑 규칙
const CATEGORY_KEYWORDS = {
  '식량': {
    keywords: ['라면', '밥', '김치', '반찬', '쌀', '과자', '빵', '음료', '물', '주스', '커피', '차', '스프', '죽', '즉석', '통조림', '참치', '스팸', '햄', '소시지', '음식', '먹', '식품', '간식', '초콜릿', '사탕', '젤리', '쿠키', '과일', '야채', '채소', '고기', '생선', '계란', '우유', '요구르트', '치즈', '버터', '잼', '꿀', '설탕', '소금', '간장', '된장', '고추장', '식용유', '참기름', '조미료', '양념'],
    subcategories: {
      '즉석식품': ['라면', '컵라면', '봉지라면', '사발면', '짜파게티', '너구리', '신라면', '진라면', '안성탕면', '즉석밥', '햇반', '오뚜기밥', '컵밥', '즉석죽', '즉석국', '즉석카레', '즉석짜장', '3분', '레토르트', '냉동', '인스턴트', '도시락', '삼각김밥', '주먹밥', 'HMR', '간편식', '미트볼', '비엔나소시지', '햄', '런천미트', '핫도그', '떡볶이', '순대', '튀김', '볶음밥', '덮밥', '김밥', '샌드위치', '햄버거', '피자', '토스트', '수프', '스프'],
      '통조림': ['참치', '통조림', '캔', '스팸', '콘', '복숭아', '과일통조림', '골뱅이', '번데기'],
      '음료': ['물', '생수', '음료', '주스', '탄산', '콜라', '사이다', '커피', '차', '우유', '두유', '이온음료', '스포츠음료', '에너지드링크', '핫초코', '코코아', '녹차', '홍차', '보리차'],
      '간식류': ['과자', '초콜릿', '사탕', '젤리', '쿠키', '비스킷', '스낵', '껌', '초코바', '에너지바', '시리얼', '견과류', '땅콩', '아몬드']
    }
  },
  '생활용품': {
    keywords: ['휴지', '티슈', '칫솔', '치약', '비누', '샴푸', '수건', '세제', '세탁', '청소', '걸레', '행주', '면도', '생리대', '기저귀', '물티슈', '손수건', '빗', '거울', '가위', '면봉', '솜', '밴드', '반창고', '건전지', '배터리', '라이터', '성냥', '양초', '손전등', '랜턴', '에탄올', '알코올', '소독용품'],
    subcategories: {
      '위생용품': ['칫솔', '치약', '비누', '샴푸', '린스', '바디워시', '폼클렌징', '면도기', '면도크림', '구강청결제', '가글', '손소독제', '손세정제', '에탄올', '소독용에탄올', '알코올', '소독용알코올', '과산화수소', '소독약', '소독제', '항균제', '살균제'],
      '여성용품': ['생리대', '탐폰', '팬티라이너', '여성청결제', '생리컵'],
      '세탁/청소': ['세제', '세탁', '섬유유연제', '표백제', '청소', '걸레', '행주', '수세미', '고무장갑', '청소포', '물걸레'],
      '일상용품': ['휴지', '화장지', '티슈', '물티슈', '수건', '타올', '손수건', '면봉', '화장솜', '거울', '빗', '머리빗', '핀', '고무줄'],
      '전기/전자용품': ['건전지', '배터리', 'AA건전지', 'AAA건전지', '알카라인건전지', '리튬건전지', '충전지', '보조배터리', '파워뱅크', '충전기', '충전케이블', 'USB케이블', 'C타입케이블', '어댑터', '멀티탭', '연장선'],
      '생활안전용품': ['라이터', '성냥', '양초', '손전등', '후레쉬', '랜턴', 'LED랜턴', '비상등', '안전등', '야광봉', '호루라기', '안전조끼', '안전모', '안전장갑', '방진마스크', '방독면', '소화기', '화재감지기', '일산화탄소감지기']
    }
  },
  '의약품': {
    keywords: ['약', '진통제', '감기약', '소화제', '밴드', '반창고', '붕대', '거즈', '소독', '연고', '파스', '마스크', '체온계', '혈압', '당뇨', '비타민', '영양제', '건강', '의료', '구급', '응급', '처방'],
    subcategories: {
      '일반의약품': ['진통제', '해열제', '감기약', '기침약', '소화제', '위장약', '설사약', '변비약', '두통약', '타이레놀', '부루펜', '아스피린', '게보린', '판콜', '판피린', '베아제', '훼스탈', '까스활명수'],
      '구급용품': ['밴드', '반창고', '붕대', '거즈', '소독약', '소독제', '과산화수소', '알코올', '에탄올', '소독용에탄올', '의료용알코올', '요오드', '포비돈', '베타딘', '연고', '후시딘', '마데카솔', '파스', '쿨파스', '핫파스', '멘소래담', '의료용테이프', '의료용가위', '핀셋', '의료용장갑'],
      '마스크류': ['마스크', 'KF94', 'KF80', 'N95', '덴탈마스크', '일회용마스크', '면마스크', '손소독제', '손세정제', '알코올'],
      '건강보조식품': ['비타민', '영양제', '오메가3', '유산균', '프로바이오틱스', '칼슘', '철분', '아연', '마그네슘', '종합비타민', '멀티비타민', '홍삼', '프로폴리스']
    }
  },
  '의류': {
    keywords: ['옷', '바지', '셔츠', '티셔츠', '속옷', '팬티', '양말', '신발', '운동화', '슬리퍼', '모자', '장갑', '목도리', '담요', '이불', '베개', '침낭', '텐트', '우비', '우산', '방한', '겨울', '여름'],
    subcategories: {
      '방한용품': ['담요', '이불', '침낭', '핫팩', '손난로', '전기장판', '온수매트', '목도리', '장갑', '귀마개', '넥워머', '방한모자'],
      '의류': ['옷', '상의', '하의', '바지', '셔츠', '티셔츠', '맨투맨', '후드티', '자켓', '점퍼', '코트', '패딩', '조끼', '치마', '원피스', '정장'],
      '속옷': ['속옷', '팬티', '브라', '브래지어', '런닝', '내의', '내복', '보정속옷', '양말', '스타킹', '레깅스'],
      '신발류': ['신발', '운동화', '구두', '부츠', '장화', '슬리퍼', '샌들', '실내화', '등산화', '작업화', '안전화']
    }
  },
  '유아·아동용품': {
    keywords: ['기저귀', '분유', '젖병', '이유식', '아기', '유아', '아동', '어린이', '장난감', '인형', '블록', '퍼즐', '크레파스', '색연필', '스케치북', '동화책', '아동복', '유아복'],
    subcategories: {
      '유아식': ['분유', '이유식', '젖병', '젖꼭지', '아기과자', '아기음료', '아기죽', '유아식', '유아과자', '치즈', '요구르트', '우유'],
      '위생용품': ['기저귀', '물티슈', '아기물티슈', '파우더', '로션', '오일', '아기비누', '아기샴푸', '아기치약', '아기칫솔'],
      '놀이용품': ['장난감', '인형', '블록', '레고', '퍼즐', '공', '자동차', '로봇', '크레파스', '색연필', '스케치북', '그림책', '동화책', '교육완구'],
      '아동복': ['아동복', '유아복', '아기옷', '바디슈트', '우주복', '턱받이', '아기신발', '아동신발', '아기모자', '아기장갑', '아기양말']
    }
  }
};

// 단위 매칭 규칙 (확장된 버전)
const UNIT_PATTERNS = {
  '개': ['개', '라면', '과자', '빵', '통조림', '캔', '비누', '칫솔', '마스크', '기저귀', '밴드', '파스', '핫팩', '컵라면', '봉지라면', '사발면', '햄버거', '샌드위치', '김밥', '주먹밥', '삼각김밥', '도시락', '과일', '사과', '배', '바나나', '귤', '오렌지', '계란', '달걀', '햄', '소시지', '치즈', '요구르트', '푸딩', '젤리', '초콜릿', '사탕', '껌', '쿠키', '비스킷'],
  '박스': ['박스', '상자', '케이스', '묶음', 'box', '박스포장', '대용량', '벌크', '다묶음'],
  '팩': ['팩', '묶음', '번들', 'pack', '세트포장', '멀티팩', '더블팩', '트리플팩', '패밀리팩'],
  '병': ['병', '음료', '물', '주스', '우유', '샴푸', '세제', '와인', '맥주', '소주', '막걸리', '콜라', '사이다', '이온음료', '비타민음료', '커피음료', '차음료', '식초', '간장', '참기름', '식용유', '드링크', '시럽', '소스'],
  '봉': ['봉', '봉지', '포', '봉투', '지퍼백', '비닐봉지', '종이봉지'],
  'kg': ['kg', '킬로', '킬로그램', 'kilogram', '쌀', '과일', '야채', '고기', '생선', '돼지고기', '소고기', '닭고기', '양파', '감자', '당근', '배추', '무', '파', '마늘', '생강', '고구마', '밀가루', '설탕', '소금'],
  'g': ['g', '그램', 'gram', '조미료', '향신료', '후추', '고춧가루', '깨', '허브', '분말', '가루', '파우더'],
  'L': ['L', '리터', 'liter', '액체', '대용량음료', '대용량물', '대용량세제'],
  'ml': ['ml', '밀리리터', 'milliliter', '소용량', '화장품', '향수', '에센스', '세럼', '앰플', '스프레이', '미스트', '에탄올', '소독용에탄올', '알코올'],
  '벌': ['옷', '의류', '속옷', '양말', '상의', '하의', '셔츠', '바지', '티셔츠', '블라우스', '스커트', '치마', '원피스', '정장', '유니폼', '작업복'],
  '켤레': ['신발', '운동화', '슬리퍼', '구두', '부츠', '샌들', '장화', '등산화', '런닝화', '스니커즈', '하이힐', '로퍼', '플랫슈즈'],
  '장': ['장갑', '마스크', '담요', '수건', '타올', '행주', '걸레', '천', '시트', '커튼', '매트', '카펫', '러그'],
  '매': ['매', '장', '휴지', '티슈', '물티슈', '종이', '냅킨', '키친타올', '페이퍼타올'],
  '롤': ['롤', '두루마리', '휴지', '화장지', '키친타올', '호일', '랩', '비닐랩', '테이프'],
  '통': ['통', '약', '영양제', '비타민', '건강식품', '알약', '캡슐', '정제', '버킷', '대용량통', '플라스틱통'],
  '세트': ['세트', '셋트', 'set', '조합', '구성', '키트', 'kit', '패키지', 'package', '선물세트', '기프트세트'],
  '묶음': ['묶음', '다발', '단', '줄', '엮음', '연결', '체인'],
  '자루': ['자루', '포대', '마대', '가마니', '부대'],
  '조각': ['조각', '피스', 'piece', '슬라이스', '컷', '토막'],
  '판': ['판', '플레이트', 'plate', '트레이', 'tray', '접시'],
  '캔': ['캔', 'can', '깡통', '통조림용기'],
  '포': ['포', '포장', '패킹', '랩핑'],
  '다스': ['다스', '더즌', 'dozen', '12개입'],
  '갑': ['갑', '담배', '성냥', '라이터'],
  '보루': ['보루', '대량', '왕창', '대용량묶음'],
  '뭉치': ['뭉치', '덩어리', '뭉텅이', '덩이'],
  '쪽': ['쪽', '조각', '파트', '부분'],
  '알': ['알', '정', '캡슐', '환', '구슬'],
  '방울': ['방울', '드롭', 'drop', '물방울'],
  '줄기': ['줄기', '대', '가지', '꽃', '식물'],
  '송이': ['송이', '꽃', '버섯', '포도'],
  '단위': ['단위', 'unit', '유닛', '개당', '낱개']
};

// 물품명에서 수량과 단위 추출 (개선된 버전)
const extractQuantityAndUnit = (itemName) => {
  // 다양한 숫자+단위 패턴 매칭
  const patterns = [
    // 기본 패턴: 숫자 + 단위
    /(\d+(?:\.\d+)?)\s*(개|박스|팩|병|봉|kg|g|L|ml|리터|밀리리터|킬로|그램|켤레|장|매|롤|통|세트|셋트|묶음|자루|조각|판|캔|포|다스|갑|보루|뭉치|쪽|알|방울|줄기|송이|단위)/i,
    // 숫자 + 입/매/정 패턴
    /(\d+)\s*(입|매|정|알|환|톨|구)/i,
    // 영문 단위 패턴
    /(\d+(?:\.\d+)?)\s*(box|pack|bottle|can|piece|set|kit|dozen|unit|pcs|ea|gram|kilogram|liter|milliliter)/i,
    // 숫자*숫자 패턴 (예: 10*3입, 5*2묶음)
    /(\d+)\s*[x\*×]\s*(\d+)\s*(개|팩|병|봉|묶음|입|매|세트)?/i,
    // 한글 수량 패턴 (예: 한박스, 두개, 세병)
    /(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(개|박스|팩|병|봉|묶음|세트|켤레|장|롤|통)/,
    // 분수 패턴 (예: 1/2박스, 반개)
    /(반|절반|1\/2|1\/3|1\/4)\s*(개|박스|팩|병|봉|묶음|세트)?/i,
    // 대략적 수량 패턴 (예: 약10개, ~20개)
    /[약~]\s*(\d+)\s*(개|박스|팩|병|봉|묶음|세트)?/i,
    // 범위 패턴 (예: 10-20개, 5~10개)
    /(\d+)\s*[-~]\s*\d+\s*(개|박스|팩|병|봉|묶음|세트)?/i
  ];

  // 모든 단위의 정규화 규칙
  const unitNormalization = {
    '입': '개',
    '매': '개',
    '정': '개',
    '알': '개',
    '환': '개',
    '톨': '개',
    '구': '개',
    '리터': 'L',
    '밀리리터': 'ml',
    '킬로': 'kg',
    '그램': 'g',
    '셋트': '세트',
    'box': '박스',
    'pack': '팩',
    'bottle': '병',
    'can': '캔',
    'piece': '개',
    'pcs': '개',
    'ea': '개',
    'set': '세트',
    'kit': '세트',
    'dozen': '다스',
    'unit': '개',
    'gram': 'g',
    'kilogram': 'kg',
    'liter': 'L',
    'milliliter': 'ml'
  };

  // 한글 숫자를 아라비아 숫자로 변환
  const koreanNumberMap = {
    '한': 1, '두': 2, '세': 3, '네': 4, '다섯': 5,
    '여섯': 6, '일곱': 7, '여덟': 8, '아홉': 9, '열': 10,
    '반': 0.5, '절반': 0.5
  };

  for (const pattern of patterns) {
    const match = itemName.match(pattern);
    if (match) {
      let quantity = match[1];
      let unit = match[2] || match[3] || '개';

      // 한글 숫자 변환
      if (koreanNumberMap[quantity]) {
        quantity = koreanNumberMap[quantity];
      } else if (quantity.includes('*') || quantity.includes('x') || quantity.includes('×')) {
        // 곱셈 패턴 처리 (예: 10*3 = 30)
        const nums = quantity.split(/[x\*×]/);
        if (nums.length === 2) {
          quantity = parseInt(nums[0]) * parseInt(nums[1]);
        }
      } else {
        quantity = parseFloat(quantity);
      }

      // 단위 정규화
      unit = unitNormalization[unit.toLowerCase()] || unit;

      // ml나 L이 포함된 경우 단위를 '병'으로 변경
      if (unit === 'ml' || unit === 'L') {
        unit = '병';
      }

      // 특수 케이스 처리
      if (itemName.includes('×') || itemName.includes('*') || itemName.includes('x')) {
        // 묶음 단위로 처리
        if (!unit || unit === '개') {
          unit = '묶음';
        }
      }

      return {
        quantity: isNaN(quantity) ? null : quantity,
        unit,
        cleanName: itemName.replace(pattern, '').trim()
      };
    }
  }

  // 패턴이 없는 경우 특수 케이스 확인
  const specialCases = {
    '하나': { quantity: 1, unit: '개' },
    '둘': { quantity: 2, unit: '개' },
    '셋': { quantity: 3, unit: '개' },
    '대량': { quantity: null, unit: '박스' },
    '소량': { quantity: null, unit: '개' },
    '낱개': { quantity: 1, unit: '개' },
    '벌크': { quantity: null, unit: '박스' }
  };

  for (const [keyword, value] of Object.entries(specialCases)) {
    if (itemName.includes(keyword)) {
      return { ...value, cleanName: itemName.replace(keyword, '').trim() };
    }
  }

  return { quantity: null, unit: null, cleanName: itemName };
};

// 물품명으로 카테고리 자동 매칭
export const matchCategory = (itemName) => {
  const normalizedName = itemName.toLowerCase().replace(/\s+/g, '');
  let bestMatch = {
    category: '기타',
    subcategory: '직접입력',
    confidence: 0,
    unit: '개'
  };

  // 수량과 단위 추출
  const { cleanName, unit: extractedUnit } = extractQuantityAndUnit(itemName);
  const searchName = cleanName || itemName;

  // 각 카테고리별로 매칭 점수 계산
  for (const [categoryName, categoryData] of Object.entries(CATEGORY_KEYWORDS)) {
    let categoryScore = 0;
    let matchedSubcategory = null;
    let highestSubScore = 0;

    // 서브카테고리별 매칭
    for (const [subcategoryName, subKeywords] of Object.entries(categoryData.subcategories)) {
      let subScore = 0;

      for (const keyword of subKeywords) {
        if (normalizedName.includes(keyword.toLowerCase())) {
          // 키워드 길이가 길수록 높은 점수
          const keywordScore = keyword.length * 10;
          // 정확히 일치하면 보너스
          if (normalizedName === keyword.toLowerCase()) {
            subScore += keywordScore * 2;
          } else {
            subScore += keywordScore;
          }
        }
      }

      if (subScore > highestSubScore) {
        highestSubScore = subScore;
        matchedSubcategory = subcategoryName;
      }
    }

    // 메인 카테고리 키워드 매칭
    for (const keyword of categoryData.keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        categoryScore += keyword.length * 5;
      }
    }

    const totalScore = categoryScore + highestSubScore;

    if (totalScore > bestMatch.confidence) {
      bestMatch = {
        category: categoryName,
        subcategory: matchedSubcategory || Object.keys(categoryData.subcategories)[0],
        confidence: totalScore,
        unit: extractedUnit || guessUnit(searchName)
      };
    }
  }

  // 신뢰도가 너무 낮으면 기타로 분류
  if (bestMatch.confidence < 10) {
    bestMatch.category = '기타';
    bestMatch.subcategory = '직접입력';
  }

  return bestMatch;
};

// 물품명으로 단위 추측 (개선된 버전)
const guessUnit = (itemName) => {
  const lowerName = itemName.toLowerCase();
  const normalizedName = lowerName.replace(/\s+/g, '');

  // 우선순위가 높은 단위부터 확인 (더 구체적인 단위를 먼저 확인)
  const priorityOrder = [
    'ml', 'L', 'g', 'kg', // 용량/무게 단위 우선
    '켤레', '벌', '장', '매', '롤', '다스', '갑', '송이', '줄기', '알', // 특수 단위
    '캔', '병', '봉', '통', '포', '자루', // 포장 단위
    '박스', '팩', '묶음', '세트', // 묶음 단위
    '개' // 기본 단위
  ];

  // 가중치 기반 매칭
  const matches = new Map();

  for (const unit of priorityOrder) {
    const keywords = UNIT_PATTERNS[unit] || [];
    let maxScore = 0;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      // 정확히 일치하는 경우 높은 점수
      if (normalizedName === keywordLower) {
        maxScore = Math.max(maxScore, 100);
      }
      // 단어 경계에서 일치하는 경우
      else if (lowerName.match(new RegExp(`\\b${keywordLower}\\b`))) {
        maxScore = Math.max(maxScore, 50);
      }
      // 부분 일치하는 경우
      else if (normalizedName.includes(keywordLower)) {
        maxScore = Math.max(maxScore, 20 + keywordLower.length);
      }
    }

    if (maxScore > 0) {
      matches.set(unit, maxScore);
    }
  }

  // 특별 규칙 적용
  // 액체류 키워드가 있으면 병 또는 L/ml 우선
  const liquidKeywords = ['음료', '주스', '우유', '물', '콜라', '사이다', '커피', '차', '술', '와인', '맥주', '소주'];
  if (liquidKeywords.some(keyword => lowerName.includes(keyword))) {
    if (matches.has('병')) matches.set('병', matches.get('병') + 30);
    if (matches.has('L')) matches.set('L', matches.get('L') + 20);
    if (matches.has('ml')) matches.set('ml', matches.get('ml') + 20);
  }

  // 대용량 키워드가 있으면 박스/묶음 우선
  const bulkKeywords = ['대용량', '대량', '벌크', '업소용', '대포장', '왕'];
  if (bulkKeywords.some(keyword => lowerName.includes(keyword))) {
    if (matches.has('박스')) matches.set('박스', matches.get('박스') + 40);
    if (matches.has('묶음')) matches.set('묶음', matches.get('묶음') + 30);
  }

  // 소량 키워드가 있으면 개 단위 우선
  const smallKeywords = ['소량', '낱개', '개별', '단품', '싱글'];
  if (smallKeywords.some(keyword => lowerName.includes(keyword))) {
    if (matches.has('개')) matches.set('개', matches.get('개') + 40);
  }

  // ml이나 L이 감지되면 '병'으로 변경
  if (matches.has('ml') || matches.has('L')) {
    // ml이나 L이 포함되면 무조건 '병' 반환
    if (/\d+\s*ml/i.test(lowerName) || /\d+\s*l\b/i.test(lowerName) ||
        /\d+\s*리터/i.test(lowerName) || /\d+\s*밀리리터/i.test(lowerName)) {
      return '병';
    }
  }

  // 가장 높은 점수를 받은 단위 반환
  if (matches.size > 0) {
    const sortedMatches = Array.from(matches.entries())
      .sort((a, b) => b[1] - a[1]);
    let bestUnit = sortedMatches[0][0];

    // ml이나 L이 최고 점수면 '병'으로 변경
    if (bestUnit === 'ml' || bestUnit === 'L') {
      return '병';
    }

    return bestUnit;
  }

  // 기본값
  return '개';
};

// 카테고리 검증 및 수정
export const validateAndFixCategory = (itemName, category, subcategory) => {
  // 자동 매칭 시도
  const matched = matchCategory(itemName);

  // 기존 카테고리가 없거나 신뢰도가 높으면 자동 매칭 사용
  if (!category || matched.confidence > 50) {
    return matched;
  }

  // 기존 카테고리 유지하되 단위만 업데이트
  return {
    category,
    subcategory,
    unit: matched.unit,
    confidence: matched.confidence
  };
};

// 유사 아이템 찾기 (오타 교정용)
export const findSimilarItems = (itemName, existingItems) => {
  const normalizedInput = itemName.toLowerCase().replace(/\s+/g, '');
  const suggestions = [];

  for (const item of existingItems) {
    const normalizedItem = item.name.toLowerCase().replace(/\s+/g, '');
    const similarity = calculateSimilarity(normalizedInput, normalizedItem);

    if (similarity > 0.6) {
      suggestions.push({
        ...item,
        similarity
      });
    }
  }

  return suggestions.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
};

// 문자열 유사도 계산 (Levenshtein Distance 기반)
const calculateSimilarity = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  if (len1 === 0) return 0;
  if (len2 === 0) return 0;

  // 초기화
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  // 계산
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 치환
          matrix[i][j - 1] + 1,     // 삽입
          matrix[i - 1][j] + 1      // 삭제
        );
      }
    }
  }

  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);
  return 1 - (distance / maxLen);
};

// 배치 처리용 - 여러 아이템 한번에 매칭
export const batchMatchCategories = (items) => {
  return items.map(itemName => ({
    itemName,
    ...matchCategory(itemName)
  }));
};

export default {
  matchCategory,
  validateAndFixCategory,
  findSimilarItems,
  batchMatchCategories,
  extractQuantityAndUnit
};