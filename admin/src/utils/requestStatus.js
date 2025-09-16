// 배송 상태에 따른 색상 및 텍스트 설정
export const getStatusConfig = (status, progress) => { 
    if (status === 'completed' || progress >= 100) {
        return {
            color: '#52c41a', // 녹색
            text: '배송완료',
            tagColor: 'success'
        };
    } else if (status === 'in_progress' || progress >= 50) {
        return {
            color: '#1890ff', // 파란색
            text: '배송중',
            tagColor: 'processing'
        };
    } else {
        return {
            color: '#f5222d', // 빨간색
            text: '배송대기',
            tagColor: 'error'
        };
    }
}
