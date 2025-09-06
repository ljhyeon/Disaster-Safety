// components/shelter/ReliefInfoCard.tsx
import { Card } from "antd";

export const ReliefInfoCard = ({ statistics, reliefSupplyRate }) => (
    <Card title="구호품 현황 (최근 7일)" size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>총 요청 건수:</span>
            <span><strong>{statistics?.total_requests || 0}</strong>건</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>총 공급 건수:</span>
            <span><strong>{statistics?.total_supplies || 0}</strong>건</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>대기 중 요청:</span>
            <span style={{ color: statistics?.pending_requests > 0 ? '#ff4d4f' : '#52c41a' }}>
                <strong>{statistics?.pending_requests || 0}</strong>건
            </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>공급률:</span>
            <span><strong>{reliefSupplyRate}%</strong></span>
        </div>
    </Card>
);

export default ReliefInfoCard;
