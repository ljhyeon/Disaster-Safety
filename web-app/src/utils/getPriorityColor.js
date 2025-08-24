// 우선순위 색상 매핑
export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'urgent':
            return 'error';
        case 'high':
            return 'warning';
        case 'normal':
        case 'medium':
            return 'info';
        case 'low':
            return 'success';
        default:
            return 'default';
    }
};