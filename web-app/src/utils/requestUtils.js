// 문자열 유사도 계산 (Jaccard 유사도 기반)
export const calculateSimilarity = (str1, str2) => {
    const normalize = (str) => str.toLowerCase().replace(/[^가-힣a-z0-9]/g, '');
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    // 완전 일치
    if (s1 === s2) return 1;
    
    // 포함 관계 확인
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // 2-gram 기반 유사도
    const getBigrams = (str) => {
        const bigrams = new Set();
        for (let i = 0; i < str.length - 1; i++) {
            bigrams.add(str.substring(i, i + 2));
        }
        return bigrams;
    };
    
    const bigrams1 = getBigrams(s1);
    const bigrams2 = getBigrams(s2);
    
    const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
    const union = new Set([...bigrams1, ...bigrams2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
};

// 사용자 희망 기부 물품과 매칭 정도 확인
export const getMatchingLevel = (request, userDonations) => {
    if (!userDonations || userDonations.length === 0) return 'none';
    
    let maxSimilarity = 0;
    userDonations.forEach(donation => {
        const similarity = calculateSimilarity(donation.item_name, request.item_name);
        maxSimilarity = Math.max(maxSimilarity, similarity);
    });
    
    if (maxSimilarity >= 0.7) return 'exact';
    if (maxSimilarity >= 0.4) return 'similar';
    return 'none';
};

// 요청 목록을 매칭 여부에 따라 분리
export const filterRequestsByMatching = (requests, userDonations) => {
    const matched = requests.filter(request => getMatchingLevel(request, userDonations) !== 'none');
    const other = requests.filter(request => getMatchingLevel(request, userDonations) === 'none');
    return { matched, other };
};