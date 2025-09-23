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
            return '#E6EDFF';
        case '낮음':
        case 'low':
        default:
            return '#FFFCEF';
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
            return '#2E14A0';
        case '낮음':
        case 'low':
        default:
            return '#E29E00';
    }
};

// 상태별 색상 및 아이콘 매핑
export const getStatusInfo = (status) => {
    switch (status) {
        case '대기중':
        case 'pending':
            return { backgroundColor: '#FFFCEF', color: '#E29E00', label: '대기중' };
        case '완료':
        case 'confirmed':
            return { backgroundColor: '#FFEFEF', color: '#FF0000', label: '확인됨' };
        case '배송중':
        case 'shipped':
            return { backgroundColor: '#EFF6FF', color: '#1428A0', label: '배송중' };
        case 'inspected':
        case 'delivered':
            return { backgroundColor: '#DCFCE7', color: '#15803D', label: '기부 완료' };
        case 'cancelled':
            return { backgroundColor: '#FEE2E2', color: '#B91C1C', label: '취소됨' };
        default:
            return { color: 'default', label: status };
    }
};