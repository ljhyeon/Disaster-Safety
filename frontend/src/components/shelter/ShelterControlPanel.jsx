import { Button, Space, Avatar, Divider } from 'antd';
import { PlusOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';

// 추후 로그인한 관리자 정보도 받아와서 이에 맞게 표기할 것
export const ShelterControlPanel = ({ shelterCount, onRegisterClick }) => {
    return (
        <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            zIndex: 1000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            minWidth: '280px'
        }}>
            <Space direction="vertical" size="medium" style={{ width: '100%' }}>
                {/* 관리자 정보 헤더 */}
                <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                }}>
                    <Avatar 
                        size={40} 
                        icon={<UserOutlined />} 
                        style={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: '2px solid rgba(255,255,255,0.3)'
                        }}
                    />
                    <div>
                        <div style={{ 
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '2px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            {/* 관리자 이름으로 변경 */}
                            윤주혁 주무관
                        </div>
                        <div style={{ 
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <EnvironmentOutlined style={{ fontSize: '10px' }} />
                            {/* 관리자 소속으로 변경 */}
                            대구광역시 북구 안전 총괄과
                        </div>
                    </div>
                </div>
                
                <Divider style={{ 
                    margin: '8px 0',
                    borderColor: 'rgba(255,255,255,0.2)'
                }} />
                
                {/* 통계 정보 */}
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    marginBottom: '12px'
                }}>
                    <div style={{ 
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '11px',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}>
                        등록된 대피소
                    </div>
                    <div style={{ 
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                        {shelterCount}개
                    </div>
                </div>
                
                {/* 액션 버튼 */}
                <Button 
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={onRegisterClick}
                    style={{
                        width: '100%',
                        height: '44px',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#667eea',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'white'
                        e.target.style.transform = 'translateY(-1px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.9)'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    대피소 등록
                </Button>
            </Space>
        </div>
    )
}