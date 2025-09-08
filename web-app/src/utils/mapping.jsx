import { Pending, CheckCircle, LocalShipping, Cancel } from "@mui/icons-material";

// 우선순위 색상 매핑
export const getPriorityBgColor = (priority) => {
    switch (priority) {
        case '높음':
        case 'urgent':
        case 'high':
            return '#FFE6E6';
        case '중간':
        case 'normal':
        case 'medium':
            return '#FFFCEF';
        case '낮음':
        case 'low':
        default:
            return '#E5E7EB';
    }
};

export const getPriorityTxtColor = (priority) => {
    switch (priority) {
        case '높음':
        case 'urgent':
        case 'high':
            return '#A0141D';
        case '중간':
        case 'normal':
        case 'medium':
            return '#E29E00';
        case '낮음':
        case 'low':
        default:
            return '#1428A0';
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