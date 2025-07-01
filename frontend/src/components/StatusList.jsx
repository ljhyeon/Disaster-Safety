import StatusItem from './StatusItem'

export const StatusList = ({ cnt = 1, data }) => {
    return (
        <div style={{ width: "100%" }}>
            {[...Array(cnt)].map((_, idx) => (
                <StatusItem key={idx} data={data[idx]} />
            ))}
        </div>
    )
}
