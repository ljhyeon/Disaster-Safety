// 대피소 추천 알고리즘 유틸리티
import { calculateSimilarity } from './requestUtils';

// 하버사인 공식을 사용한 두 지점 간 거리 계산 (km 단위)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

    const R = 6371; // 지구 반경 (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

const toRad = (value) => (value * Math.PI) / 180;

// 간단한 거리 점수 계산 (0~1 범위) - 택배 배송 기준
export const getDistanceScore = (distance) => {
    if (distance === Infinity) return 0.7; // 거리 정보 없을 때 기본 점수
    if (distance <= 10) return 1; // 10km 이내는 만점 (같은 도시)
    if (distance <= 30) return 0.95; // 30km 이내 95% (인근 도시)
    if (distance <= 50) return 0.9; // 50km 이내 90% (같은 광역시/도)
    if (distance <= 100) return 0.85; // 100km 이내 85% (인접 광역시/도)
    if (distance <= 200) return 0.8; // 200km 이내 80% (중거리)
    if (distance <= 300) return 0.75; // 300km 이내 75% (장거리)
    return 0.7; // 300km 이상도 70% (전국 택배 가능)
};

// Priority 점수 계산 (0~1 범위) - 더 높은 기본 점수
export const getPriorityScore = (priority) => {
    const priorityMap = {
        'urgent': 1,
        'high': 0.9,
        'normal': 0.75,
        'low': 0.6
    };
    return priorityMap[priority] || 0.75;
};

// 아이템 매칭 점수 계산 - 보유 물품과 매칭되는 경우만 점수 부여
export const getItemMatchingScore = (request, userDonations) => {
    if (!userDonations || userDonations.length === 0) return 0; // 기부 물품 없으면 0점

    let bestMatch = {
        similarity: 0,
        quantityMatch: 0,
        donation: null,
        hasMatch: false
    };

    userDonations.forEach(donation => {
        // 정규화된 문자열로 직접 비교 (더 엄격한 매칭)
        const donationNorm = donation.item_name.toLowerCase().replace(/\s+/g, '');
        const requestNorm = request.item_name.toLowerCase().replace(/\s+/g, '');

        let similarity = 0;

        // 1. 완전 일치
        if (donationNorm === requestNorm) {
            similarity = 1;
        }
        // 2. 포함 관계 (한쪽이 다른 쪽을 포함)
        else if (donationNorm.includes(requestNorm) || requestNorm.includes(donationNorm)) {
            // 길이 비율로 유사도 계산 (짧은 문자열이 긴 문자열의 대부분을 차지해야 함)
            const minLen = Math.min(donationNorm.length, requestNorm.length);
            const maxLen = Math.max(donationNorm.length, requestNorm.length);
            similarity = minLen / maxLen * 0.8;
        }
        // 3. 부분 일치는 매칭으로 보지 않음
        else {
            similarity = 0;
        }

        // 카테고리가 일치하면 보너스 (단, 기본 유사도가 있을 때만)
        if (similarity > 0) {
            if (donation.category === request.category) similarity += 0.1;
            if (donation.subcategory === request.subcategory) similarity += 0.05;
            similarity = Math.min(1, similarity);
        }

        // 수량 매칭 비율 (기부 가능 수량 / 요청 수량)
        const quantityRatio = Math.min(1, donation.quantity / request.quantity);

        // 유사도가 0.5 이상일 때만 매칭으로 간주 (더 엄격한 기준)
        if (similarity >= 0.5 && similarity > bestMatch.similarity) {
            bestMatch = {
                similarity: similarity,
                quantityMatch: quantityRatio,
                donation: donation,
                hasMatch: true
            };
        }
    });

    // 매칭이 없으면 0점 반환
    if (!bestMatch.hasMatch) {
        return 0;
    }

    // 매칭이 있으면 점수 계산
    const baseScore = 0.5; // 매칭되면 기본 50%
    const bonusScore = bestMatch.similarity * 0.3 + bestMatch.quantityMatch * 0.2;
    return Math.min(1, baseScore + bonusScore);
};

// 종합 매칭 점수 계산
export const calculateMatchingScore = (request, userInfo, userDonations) => {
    // 1. 거리 점수 (40%)
    let distanceScore = 0;
    if (userInfo?.coordinates && request.shelter?.coordinates) {
        const distance = calculateDistance(
            userInfo.coordinates.lat,
            userInfo.coordinates.lng,
            request.shelter.coordinates.lat,
            request.shelter.coordinates.lng
        );
        distanceScore = getDistanceScore(distance);
    }

    // 2. Priority 점수 (20%)
    const priorityScore = getPriorityScore(request.priority);

    // 3. 아이템 매칭 점수 (30%)
    const itemMatchScore = getItemMatchingScore(request, userDonations);

    // 4. 시간 긴급도 점수 (10%) - 최근 요청일수록 높은 점수
    const daysSinceCreated = (new Date() - new Date(request.created_at)) / (1000 * 60 * 60 * 24);
    let timeScore = 0.8; // 기본 점수 80%
    if (daysSinceCreated <= 1) timeScore = 1; // 하루 이내면 만점
    else if (daysSinceCreated <= 7) timeScore = 0.9; // 일주일 이내 90%
    else if (daysSinceCreated <= 30) timeScore = 0.8; // 한달 이내 80%
    else timeScore = 0.7; // 그 이상도 70%

    // 가중치 적용한 종합 점수 (택배 배송 고려)
    const weights = {
        distance: 0.15,  // 거리 비중 대폭 감소 (택배는 전국 가능)
        priority: 0.35, // 우선순위 비중 증가
        itemMatch: 0.4, // 물품 매칭 비중 최우선
        time: 0.1
    };

    const totalScore =
        distanceScore * weights.distance +
        priorityScore * weights.priority +
        itemMatchScore * weights.itemMatch +
        timeScore * weights.time;

    return {
        totalScore,
        distanceScore,
        priorityScore,
        itemMatchScore,
        timeScore,
        distance: userInfo?.coordinates && request.shelter?.coordinates
            ? calculateDistance(
                userInfo.coordinates.lat,
                userInfo.coordinates.lng,
                request.shelter.coordinates.lat,
                request.shelter.coordinates.lng
            )
            : Infinity
    };
};

// 추천 목록 생성 및 정렬
export const generateRecommendations = (requests, userInfo, userDonations) => {
    const requestsWithScores = requests.map(request => {
        const scoreDetails = calculateMatchingScore(request, userInfo, userDonations);
        return {
            ...request,
            matchingScore: scoreDetails.totalScore,
            scoreDetails
        };
    });

    // 총 점수로 정렬 (높은 점수가 먼저)
    requestsWithScores.sort((a, b) => b.matchingScore - a.matchingScore);

    return requestsWithScores;
};

// 매칭 레벨 결정 (UI 표시용)
export const getMatchingLevel = (score) => {
    if (score >= 0.8) return { level: 'excellent', color: '#1428A0' };
    if (score >= 0.6) return { level: 'good', color: '#1428A0' };
    if (score >= 0.4) return { level: 'fair', color: '#1428A0' };
    if (score >= 0.2) return { level: 'low', color: '#1428A0' };
    return { level: 'none', color: '#6B7280' };
};