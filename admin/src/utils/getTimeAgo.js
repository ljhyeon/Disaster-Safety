// 시간 차이 계산 함수
export const getTimeAgo = (dateString) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now - past
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    const remainingHours = diffHours % 24

    if (diffHours < 24) {
        return `${diffHours}시간 전`
    } else if (remainingHours === 0) {
        return `${diffDays}일 전`
    } else {
        return `${diffDays}일 ${remainingHours}시간 전`
    }
}