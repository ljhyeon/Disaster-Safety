// components/shelter/ReliefInfoCard.tsx
import { Card } from "antd";

export const ReliefInfoCard = ({ items = [] }) => (
    <Card title="우선 필요 용품 TOP 5" size="small">
        {items.slice(0, 5).map((item, index) => (
            <div
                key={index}
                style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                }}
            >
                <span>{item.name}</span>
                <span>
                    <strong>{item.percent || 0}</strong>%
                </span>
            </div>
        ))}
    </Card>
);

export default ReliefInfoCard;
