// components/notification/NotificationList.tsx
import { Card } from "antd";
import { getTimeAgo } from '../../utils/getTimeAgo';

const NotificationList = ({ title, notifications }) => (
    <Card title={title} style={{ marginTop: "24px" }}>
        {notifications.length > 0 ? (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {notifications.map((n, idx) => (
                    <div key={n.id || `${n.type}_${idx}`} style={{
                        padding: "16px",
                        borderBottom: idx < notifications.length - 1 ? "1px solid #f0f0f0" : "none",
                        display: "flex",
                        alignItems: "flex-start"
                    }}>
                        <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: n.type === "request" ? "#1890ff" : "#52c41a",
                            marginTop: "6px",
                            marginRight: "12px",
                            flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", marginBottom: "4px", color: "#333" }}>
                                {n.message}
                            </div>
                            <div style={{ fontSize: "12px", color: "#999" }}>
                                {getTimeAgo(n.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                알림이 없습니다.
            </div>
        )}
    </Card>
);

export default NotificationList;
