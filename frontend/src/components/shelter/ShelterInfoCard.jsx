// components/shelter/ShelterInfoCard.tsx
import { Card } from "antd";

export const ShelterInfoCard = ({ shelter }) => (
    <Card title="대피소 현황" size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>수용 인원:</span>
            <span><strong>{shelter.current_occupancy}</strong> / {shelter.capacity}명</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>수용률:</span>
            <span><strong>{shelter.occupancy_rate}%</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>운영 상태:</span>
            <span style={{ 
                color: shelter.status === '운영중' ? '#52c41a' : 
                        shelter.status === '포화' ? '#ff4d4f' : '#faad14'
            }}>
                <strong>{shelter.status}</strong>
            </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>재난 유형:</span>
            <span><strong>{shelter.disaster_type}</strong></span>
        </div>
    </Card>
);

export default ShelterInfoCard;
