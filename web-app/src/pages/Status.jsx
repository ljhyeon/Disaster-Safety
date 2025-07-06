import { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Chip, 
    CircularProgress, 
    Alert, 
    Button,
    Stack,
    Divider
} from '@mui/material';
import { 
    CheckCircle, 
    Cancel, 
    Pending, 
    LocalShipping 
} from '@mui/icons-material';

import { getReliefSuppliesByUser, updateSupplyTracking, RELIEF_SUPPLY_STATUS } from '../services/reliefService';
import { TrackingDialog } from '../components/TrackingDialog';
import { TrackingViewDialog } from '../components/TrackingViewDialog';
import { useAuthStore } from '../store/authStore';

export function Status() {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trackingOpen, setTrackingOpen] = useState(false);
    const [trackingViewOpen, setTrackingViewOpen] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            loadSupplies();
        }
    }, [user]);

    const loadSupplies = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getReliefSuppliesByUser(user.uid);
            if (result.success) {
                setSupplies(result.supplies);
            } else {
                setError(result.error.message);
            }
        } catch (err) {
            setError('공급 이력을 불러오는 중 오류가 발생했습니다.');
            console.error('공급 이력 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 송장번호 등록/조회 모달 열기
    const handleTrackingClick = (supply) => {
        setSelectedSupply(supply);
        // 운송장이 등록되어 있으면 조회 모달, 없으면 등록 모달
        if (supply.courier_company && supply.tracking_number) {
            setTrackingViewOpen(true);
        } else {
            setTrackingOpen(true);
        }
    };

    // 송장번호 등록 처리
    const handleTrackingSubmit = async (trackingData) => {
        if (!selectedSupply) return;
        
        setSubmitting(true);
        
        try {
            const result = await updateSupplyTracking(selectedSupply.id, trackingData);
            if (result.success) {
                setTrackingOpen(false);
                setSelectedSupply(null);
                alert('송장번호가 등록되었습니다.');
                loadSupplies(); // 목록 새로고침
            } else {
                alert(`송장번호 등록 실패: ${result.error.message}`);
            }
        } catch (err) {
            alert('송장번호 등록 중 오류가 발생했습니다.');
            console.error('송장번호 등록 실패:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // 상태별 색상 및 아이콘 매핑
    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { color: 'warning', icon: <Pending />, label: '대기중' };
            case 'confirmed':
                return { color: 'info', icon: <CheckCircle />, label: '확인됨' };
            case 'shipped':
                return { color: 'primary', icon: <LocalShipping />, label: '배송중' };
            case 'delivered':
                return { color: 'success', icon: <LocalShipping />, label: '전달완료' };
            case 'cancelled':
                return { color: 'error', icon: <Cancel />, label: '취소됨' };
            default:
                return { color: 'default', icon: <Pending />, label: status };
        }
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 통계 계산
    const statistics = supplies.reduce((acc, supply) => {
        acc.total++;
        switch (supply.status) {
            case 'pending':
                acc.pending++;
                break;
            case 'confirmed':
                acc.confirmed++;
                break;
            case 'shipped':
                acc.shipped++;
                break;
            case 'delivered':
                acc.delivered++;
                break;
            case 'cancelled':
                acc.cancelled++;
                break;
        }
        return acc;
    }, { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 });

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress />
                <Typography>공급 이력을 불러오는 중...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="outlined" onClick={loadSupplies}>
                    다시 시도
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {supplies.length === 0 ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '300px',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <Typography variant="h6" color="text.secondary">
                        아직 배송 이력이 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        구호품 배송 페이지에서 도움이 필요한 대피소를 도와주세요
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {supplies.map((supply, index) => {
                        const statusInfo = getStatusInfo(supply.status);
                        
                        return (
                            <Box key={supply.id}>
                                <Box 
                                    sx={{ 
                                        cursor: 'pointer',
                                        pl: 2,
                                        pr: 2,
                                        pt: 1,
                                        pb: 1,
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        },
                                        transition: 'background-color 0.2s ease-in-out'
                                    }}
                                    onClick={() => handleTrackingClick(supply)}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                {supply.item_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {supply.shelter?.shelter_name || '대피소 정보 없음'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                            <Chip 
                                                label={statusInfo.label}
                                                color={statusInfo.color}
                                                size="small"
                                                icon={statusInfo.icon}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                배송 수량: {supply.supplied_quantity} {supply.unit}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {supply.courier_company && supply.tracking_number && (
                                        <Box sx={{ mt: 2, p: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                            <Typography variant="body2" fontWeight="bold" color="primary">
                                                배송 정보
                                            </Typography>
                                            <Typography variant="body2">
                                                택배사: {supply.courier_company} | 송장번호: {supply.tracking_number}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                
                                {/* 마지막 아이템이 아닌 경우에만 구분선 표시 */}
                                {index < supplies.length - 1 && (
                                    <Box sx={{ 
                                        height: '1px', 
                                        backgroundColor: 'divider'
                                    }} />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            <TrackingDialog
                open={trackingOpen}
                onClose={() => setTrackingOpen(false)}
                onSubmit={handleTrackingSubmit}
                shelter={selectedSupply?.shelter?.shelter_name}
                item={selectedSupply?.item_name}
                quantity={selectedSupply?.supplied_quantity}
                unit={selectedSupply?.unit}
                loading={submitting}
            />

            <TrackingViewDialog
                open={trackingViewOpen}
                onClose={() => setTrackingViewOpen(false)}
                supply={selectedSupply}
            />
        </Box>
    );
}