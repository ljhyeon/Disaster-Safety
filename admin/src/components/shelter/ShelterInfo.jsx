import { Descriptions, Divider } from 'antd'

export const ShelterInfo = ({ shelter }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case '운영중': return '#52c41a'
            case '포화': return '#ff4d4f'
            default: return '#faad14'
        }
    }

    return (
        <>
            <Descriptions column={3} layout="horizontal" bordered={false}>
                <Descriptions.Item label="대피소명" span={3}>{shelter.shelter_name}</Descriptions.Item>

                <Descriptions.Item label="대피소 ID">{shelter.shelter_id}</Descriptions.Item>
                <Descriptions.Item label="담당자 성명">{shelter.contact_person}</Descriptions.Item>
                <Descriptions.Item label="발생 재난 유형">{shelter.disaster_type}</Descriptions.Item>

                <Descriptions.Item label="대피소 주소" span={2}>{shelter.location}</Descriptions.Item>
                <Descriptions.Item label="담당자 연락처">{shelter.contact_phone}</Descriptions.Item>

                <Descriptions.Item label="위도">{shelter.latitude}</Descriptions.Item>
                <Descriptions.Item label="경도">{shelter.longitude}</Descriptions.Item>
                <Descriptions.Item label="운영 상태">
                    <span style={{ color: getStatusColor(shelter.status) }}>
                        {shelter.status}
                    </span>
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions column={3} layout="horizontal" bordered={false}>
                <Descriptions.Item label="수용 가능 인원수">{shelter.capacity}명</Descriptions.Item>
                <Descriptions.Item label="장애인 편의시설 여부">{shelter.has_disabled_facility ? '여' : '부'}</Descriptions.Item>
                <Descriptions.Item label="수용률">{shelter.occupancy_rate}%</Descriptions.Item>

                <Descriptions.Item label="현재 대피 인원 수">{shelter.current_occupancy}명</Descriptions.Item>
                <Descriptions.Item label="반려동물 수용 가능 여부">{shelter.has_pet_zone ? '여' : '부'}</Descriptions.Item>
                <Descriptions.Item label="등록일">
                    {new Date(shelter.created_at).toLocaleDateString()}
                </Descriptions.Item>
            </Descriptions>
        </>
    )
}