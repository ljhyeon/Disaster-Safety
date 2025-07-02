import NotificationItem from './NotificationItem'

export const NotificationList = ({ cnt = 1, data }) => {
    return (
        <div style={{ width: "100%" }}>
            {[...Array(cnt)].map((_, idx) => (
                <NotificationItem key={idx} data={data[idx]} />
            ))}
        </div>
    )
}
