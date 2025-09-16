import { useState, useMemo } from 'react';
import { Button, Space, Avatar, Input, List, Tag, Progress } from 'antd';
import { UserOutlined, SearchOutlined, QuestionCircleOutlined, EnvironmentFilled, } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export const ShelterControlPanel = ({ shelters, onFocusShelter }) => {
    const [query, setQuery] = useState('');
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login', { replace: true });
        } else {
            console.error("로그아웃 실패:", result.error.message);
            alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 검색 필터
    const filteredShelters = useMemo(() => {
        if (!shelters) return [];
        if (!query) return shelters; // 검색어 없으면 전체 반환

        const lowerQuery = query.toLowerCase();
        return shelters.filter(
            (s) =>
                s.shelter_name.toLowerCase().includes(lowerQuery) ||
                s.location.toLowerCase().includes(lowerQuery)
        );
    }, [query, shelters]);

    // 수용률 계산
    const getPercent = (capacity, current) => {
        if (!capacity) return 0;
        return Math.round((current / capacity) * 100);
    };

    // 색상 규칙 (초록/노랑/빨강)
    const getProgressColor = (percent) => {
        if (percent < 30) return '#22C55E';   // green
        if (percent < 60) return '#EAB308';   // yellow
        return '#DC2626';                     // red
    };

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: '#fff',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.08)',
            minWidth: '360px',
        }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* 상단 관리자 정보 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #E5E7EB',
                    padding: 12,
                    borderRadius: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar
                            size={40}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#2563EB' }}
                        />
                        <div>
                            {/* TOOD: 로그인한 사용자 정보에 맞게 변경 (근데 과와 직책은 어떻게 알지요) */}
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>윤주혁 주무관</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>안전재난과</div>
                        </div>
                    </div>
                    {/* TODO: 로그아웃 기능 구현 */}
                    <Button type="text" style={{ color: 'red', fontWeight: 600 }} onClick={handleLogout}>LOGOUT</Button>
                </div>

                {/* 검색창 */}
                <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
                        대피소 검색
                    </div>
                    <Input
                        placeholder="지역명 또는 대피소명 검색"
                        prefix={<SearchOutlined />}
                        allowClear
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                {/* 검색 결과 개수 */}
                <div style={{ fontSize: '13px', color: '#555' }}>
                    검색결과 <span style={{ fontWeight: 'bold' }}>{filteredShelters.length}개</span>
                </div>

                {/* 검색 결과 리스트 */}
                <List
                    dataSource={filteredShelters}
                    renderItem={(item) => {
                        const percent = getPercent(item.capacity, item.current);
                        return (
                            <List.Item
                                key={item.id}
                                style={{ border: 'none', padding: 0, marginBottom: 12 }}
                            >
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    border: '1px solid #E5E7EB',
                                    padding: 12,
                                    borderRadius: 12,
                                    gap: 12,
                                }}>
                                    {/* 상단 제목 + 거리 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <EnvironmentFilled style={{ color: '#3B82F6' }} />
                                                <span style={{ fontWeight: 600 }}>{item.shelter_name}</span>
                                            </div>
                                            <Tag color="#EFF6FF" style={{ color: '#1D4ED8', borderRadius: 24 }}>
                                                {item.distance}km
                                            </Tag>
                                        </div>
                                        {/* TOOO: 기능 미구현 */}
                                        <Button type="link" size="small" style={{ color: '#3B82F6', padding: 0 }} onClick={() => onFocusShelter(item)}>
                                            지도에서 보기
                                        </Button>
                                    </div>

                                    {/* 주소 */}
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        {item.location}
                                    </span>

                                    {/* 수용현황 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Tag style={{ color: '#374151', borderRadius: 24, border: 0 }}>
                                            수용 가능 {item.capacity}명
                                        </Tag>
                                        <Tag color="#FEF2F2" style={{ color: '#DC2626', borderRadius: 24, border: 0 }}>
                                            현재 대피 {item.current_occupancy}명
                                        </Tag>
                                        <Progress
                                            percent={percent}
                                            size="small"
                                            strokeColor={getProgressColor(percent)}
                                            style={{ flex: 1, marginLeft: 8 }}
                                        />
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                    style={{
                        height: "75vh",
                        overflowY: "auto",
                    }}
                    locale={{
                        emptyText: (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                <QuestionCircleOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                                <div style={{ fontWeight: 'bold' }}>검색 결과가 없습니다</div>
                                <div>정확한 주소를 입력하거나 지도를 이동해 범위를 조정하세요.</div>
                            </div>
                        ),
                    }}
                />
            </Space>
        </div>
    );
};
