import { useNavigate } from 'react-router-dom';

import { Button, Typography, Descriptions, Divider, message } from 'antd';
const { Title, } = Typography;

import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShelterInfo } from '../components/shelter/ShelterInfo';

import { useShelterStore } from '../store/useShelterStore';

import { getShelter } from '../services/shelterService';

import { useAsync } from '../hooks/useAsync';

const Setting = () => {
    const navigate = useNavigate()
    const selectedId = useShelterStore((s)=>s.selectedId)

    const { data: shelterData, loading: isLoading, } = useAsync(
        () => {
            if (!selectedId) {
                message.error('대피소가 선택되지 않았습니다.');
                navigate('/home');
                return Promise.resolve(null);
            }
            return getShelter(selectedId);
        },
        [selectedId, navigate],
        {
            errorMessage: '대피소 정보를 불러올 수 없습니다.',
            onError: () => {
                navigate('/home');
            }
        }
    );

    const shelter = shelterData?.shelter || null;

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <LoadingSpinner text="대피소 정보를 불러오는 중...<" />
        )
    }

    if (!shelter && !isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Title level={3}>대피소 정보를 찾을 수 없습니다.</Title>
                <Button onClick={() => navigate('/home')}>홈으로 돌아가기</Button>
            </div>
        )
    }

    return (
        <>
            <Title level={1}>
                대피소 정보
            </Title>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={()=>{navigate(`/editsetting/${selectedId}`)}}>정보 수정</Button>
            </div>

            <ShelterInfo shelter={shelter} />
        </>
    )
}

export default Setting;