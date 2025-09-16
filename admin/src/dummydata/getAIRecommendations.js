// AI 추천 더미 데이터 - 지진과 화재 재난 시나리오
export const getAIRecommendations = () => {
    const scenarios = [
        // 지진 재난 시나리오
        {
            predictions: [
                {
                    category: "안전용품",
                    item: "안전모",
                    currentStock: 15,
                    predictedNeed: 80,
                    shortage: 65,
                    unit: "개",
                    priority: "urgent",
                    reason: "여진 발생 시 낙하물로부터 머리 보호 필수"
                },
                {
                    category: "의료용품",
                    item: "일회용 붕대",
                    currentStock: 30,
                    predictedNeed: 120,
                    shortage: 90,
                    unit: "롤",
                    priority: "urgent",
                    reason: "지진으로 인한 외상 환자 급증 예상"
                },
                {
                    category: "생활용품",
                    item: "LED 손전등",
                    currentStock: 25,
                    predictedNeed: 100,
                    shortage: 75,
                    unit: "개",
                    priority: "high",
                    reason: "정전 상황 대비 필수품"
                },
                {
                    category: "식품",
                    item: "참치캔",
                    currentStock: 40,
                    predictedNeed: 200,
                    shortage: 160,
                    unit: "캔",
                    priority: "high",
                    reason: "조리 시설 파손 시 즉석 섭취 가능 식품"
                },
                {
                    category: "식품",
                    item: "생수 2L",
                    currentStock: 50,
                    predictedNeed: 300,
                    shortage: 250,
                    unit: "병",
                    priority: "urgent",
                    reason: "상수도 시설 파손으로 인한 급수 중단"
                },
                {
                    category: "생활용품",
                    item: "알카라인 건전지 AA",
                    currentStock: 60,
                    predictedNeed: 200,
                    shortage: 140,
                    unit: "개",
                    priority: "high",
                    reason: "손전등 및 라디오 작동용"
                },
                {
                    category: "식품",
                    item: "컵라면",
                    currentStock: 80,
                    predictedNeed: 300,
                    shortage: 220,
                    unit: "개",
                    priority: "normal",
                    reason: "간편 조리 가능한 비상식품"
                },
                {
                    category: "의료용품",
                    item: "소독용 에탄올",
                    currentStock: 10,
                    predictedNeed: 50,
                    shortage: 40,
                    unit: "병",
                    priority: "high",
                    reason: "상처 소독 및 감염 예방"
                }
            ],
            historicalCases: [
                {
                    location: "경주시 임시대피소",
                    disaster: "지진 5.8규모",
                    year: "2016",
                    items: ["안전모", "LED 손전등", "알카라인 건전지", "응급처치키트"]
                },
                {
                    location: "포항시 북구 대피소",
                    disaster: "지진 5.4규모",
                    year: "2017",
                    items: ["텐트", "침낭", "휴대용 라디오", "생수 2L"]
                },
                {
                    location: "일본 구마모토 대피소",
                    disaster: "지진 7.0규모",
                    year: "2016",
                    items: ["방재헬멧", "비상식량", "휴대용 가스버너", "담요"]
                }
            ]
        },
        // 화재 재난 시나리오
        {
            predictions: [
                {
                    category: "의료용품",
                    item: "화상치료연고",
                    currentStock: 8,
                    predictedNeed: 40,
                    shortage: 32,
                    unit: "개",
                    priority: "urgent",
                    reason: "화재로 인한 화상 환자 응급처치"
                },
                {
                    category: "위생용품",
                    item: "KF94 마스크",
                    currentStock: 100,
                    predictedNeed: 300,
                    shortage: 200,
                    unit: "개",
                    priority: "urgent",
                    reason: "연기 흡입 방지 및 호흡기 보호"
                },
                {
                    category: "의류",
                    item: "면 속옷세트",
                    currentStock: 20,
                    predictedNeed: 150,
                    shortage: 130,
                    unit: "세트",
                    priority: "high",
                    reason: "화재로 인한 의류 소실, 기본 의류 필요"
                },
                {
                    category: "생활용품",
                    item: "칫솔치약세트",
                    currentStock: 15,
                    predictedNeed: 80,
                    shortage: 65,
                    unit: "세트",
                    priority: "normal",
                    reason: "개인 위생 관리용품 소실"
                },
                {
                    category: "식품",
                    item: "생수 500ml",
                    currentStock: 200,
                    predictedNeed: 600,
                    shortage: 400,
                    unit: "병",
                    priority: "urgent",
                    reason: "탈수 방지 및 수분 보충"
                },
                {
                    category: "의료용품",
                    item: "인공호흡용 산소마스크",
                    currentStock: 5,
                    predictedNeed: 25,
                    shortage: 20,
                    unit: "개",
                    priority: "urgent",
                    reason: "연기 흡입으로 인한 호흡곤란 응급처치"
                },
                {
                    category: "생활용품",
                    item: "수건",
                    currentStock: 30,
                    predictedNeed: 120,
                    shortage: 90,
                    unit: "장",
                    priority: "high",
                    reason: "화상 부위 냉각 및 개인 위생"
                },
                {
                    category: "식품",
                    item: "핫초코믹스",
                    currentStock: 20,
                    predictedNeed: 100,
                    shortage: 80,
                    unit: "개",
                    priority: "normal",
                    reason: "심리적 안정감 제공 및 체온 유지"
                }
            ],
            historicalCases: [
                {
                    location: "강원도 고성군 대피소",
                    disaster: "산불",
                    year: "2019",
                    items: ["KF94 마스크", "면 속옷세트", "칫솔치약세트", "화상치료연고"]
                },
                {
                    location: "울진군 임시대피소",
                    disaster: "대형산불",
                    year: "2022",
                    items: ["공기청정기", "인공눈물", "목캔디", "담요"]
                },
                {
                    location: "속초시 설악동 대피소",
                    disaster: "산불",
                    year: "2023",
                    items: ["산소마스크", "화상연고", "생리식염수", "거즈"]
                }
            ]
        }
    ]

    // 랜덤하게 지진 또는 화재 시나리오 선택
    const randomIndex = Math.floor(Math.random() * 2)
    return scenarios[randomIndex]
}