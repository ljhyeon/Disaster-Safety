import { Pending, CheckCircle, LocalShipping, Cancel } from "@mui/icons-material";

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

// 상태별 색상 및 아이콘 매핑
export const getStatusInfo = (status) => {
    switch (status) {
        case 'pending':
            return { color: 'warning', icon: <Pending />, label: '대기중' };
        case 'confirmed':
            return { color: 'info', icon: <CheckCircle />, label: '확인됨' };
        case 'shipped':
            return { color: 'primary', icon: <LocalShipping />, label: '배송중' };
        case 'delivered':
            return { color: 'success', icon: <LocalShipping />, label: '전달완료' };
        case 'cancelled':
            return { color: 'error', icon: <Cancel />, label: '취소됨' };
        default:
            return { color: 'default', icon: <Pending />, label: status };
    }
};