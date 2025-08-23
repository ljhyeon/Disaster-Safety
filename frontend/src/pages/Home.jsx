import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { Layout, } from 'antd';

import { LoadingSpinner } from '../components/common/LoadingSpinner';

import { useShelters } from '../hooks/shelter/useShelters';
import { useShelterStore } from '../store/useShelterStore';

import { ShelterControlPanel } from '../components/shelter/ShelterControlPanel';
import { ShelterMap } from '../components/shelter/ShelterMap';

const Home = () => {
    const navigate = useNavigate();
    const setSelectedId = useShelterStore((s)=>s.setSelectedId);
    const setName = useShelterStore((s)=>s.setName);

    const { shelters, isLoading, } = useShelters();

    const handleShelterSelect = useCallback((shelterId, name) => {
        setSelectedId(shelterId);
        setName(name);
        navigate(`/main/${shelterId}`);
    }, [setSelectedId, setName, navigate]);

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <Layout style={{ minHeight: '100vh', width: '100vw', backgroundColor: "white" }}>
                <LoadingSpinner text="대피소 정보를 불러오는 중..." />
            </Layout>
        )
    }

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', backgroundColor: "white" }}>
            {/* 상단 컨트롤 바 */}
            <ShelterControlPanel 
                shelterCount={shelters.length}
                onRegisterClick={() => navigate('/shelter-register')}
            />

            <ShelterMap 
                shelters={shelters}
                onShelterSelect={handleShelterSelect}
            />
        </Layout>
    )
}

export default Home;