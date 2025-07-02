import { Button, Typography, Descriptions, Divider } from 'antd';
import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'

const { Title, } = Typography

import { shelterInfo } from '../dummydata/settingData';

const Setting = () => {
    const navigate = useNavigate()
    const selectedId = useShelterStore((s)=>s.selectedId)
    return (
        <>
            <Title level={1}>
                대피소 정보
            </Title>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={()=>{navigate(`/editsetting/${selectedId}`)}}>정보 수정</Button>
            </div>

            <Descriptions column={3} layout="horizontal" bordered={false}>
                <Descriptions.Item label="대피소명" span={3}>
                    {shelterInfo.name}
                </Descriptions.Item>

                <Descriptions.Item label="대피소 코드">{shelterInfo.code}</Descriptions.Item>
                <Descriptions.Item label="최고 담당자 성명">{shelterInfo.manager}</Descriptions.Item>
                <Descriptions.Item label="발생 재난 유형">{shelterInfo.disasterType}</Descriptions.Item>

                <Descriptions.Item label="대피소 주소">{shelterInfo.address}</Descriptions.Item>
                <Descriptions.Item label="최고 담당자 연락처">{shelterInfo.contact}</Descriptions.Item>

            </Descriptions>

            <Divider />

            <Descriptions column={3} layout="horizontal" bordered={false}>
                <Descriptions.Item label="수용 가능 인원수">{shelterInfo.capacity}</Descriptions.Item>
                <Descriptions.Item label="장애인 편의시설 여부">{shelterInfo.accessible}</Descriptions.Item>
                <Descriptions.Item label="대피소 현 운영 상태">{shelterInfo.status}</Descriptions.Item>

                <Descriptions.Item label="현재 대피 인원 수">{shelterInfo.currentPeople}</Descriptions.Item>
                <Descriptions.Item label="반려동물 수용 가능 여부">{shelterInfo.petAllowed}</Descriptions.Item>
            </Descriptions>
        </>
    )
}

export default Setting;