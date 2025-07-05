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
    LocationOn, 
    Schedule, 
    CheckCircle, 
    Cancel, 
    Pending, 
    LocalShipping 
} from '@mui/icons-material';

import { getReliefSuppliesByUser, updateSupplyTracking, RELIEF_SUPPLY_STATUS } from '../services/reliefService';
import { TrackingDialog } from '../components/TrackingDialog';
import { useAuthStore } from '../store/authStore';

export function Status() {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trackingOpen, setTrackingOpen] = useState(false);
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

    // 송장번호 등록 모달 열기
    const handleTrackingClick = (supply) => {
        setSelectedSupply(supply);
        setTrackingOpen(true);
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
        <Box sx={{ p: 2 }}>
            {/* 헤더 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h1">
                    나의 공급 이력
                </Typography>
                <Button variant="outlined" size="small" onClick={loadSupplies}>
                    새로고침
                </Button>
            </Box>

            {/* 통계 카드 */}
            <Box sx={{ mb: 3 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            공급 현황
                        </Typography>
                        <Stack direction="row" spacing={3} justifyContent="space-around">
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main">
                                    {statistics.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    총 공급
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main">
                                    {statistics.pending}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    대기중
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main">
                                    {statistics.shipped}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    배송중
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main">
                                    {statistics.delivered}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    전달완료
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            {/* 공급 이력 목록 */}
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
                        아직 공급 이력이 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        구호품 공급 페이지에서 도움이 필요한 대피소를 도와주세요
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {supplies.map((supply) => {
                        const statusInfo = getStatusInfo(supply.status);
                        
                        return (
                            <Card key={supply.id}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                                                {supply.item_name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <LocationOn fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {supply.shelter?.shelter_name || '대피소 정보 없음'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Schedule fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(supply.created_at)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                            <Chip 
                                                label={statusInfo.label}
                                                color={statusInfo.color}
                                                size="small"
                                                icon={statusInfo.icon}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                공급량: {supply.supplied_quantity} {supply.unit}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip 
                                                label={supply.category}
                                                variant="outlined"
                                                size="small"
                                            />
                                            <Chip 
                                                label={supply.subcategory}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            요청량: {supply.requested_quantity} {supply.unit}
                                        </Typography>
                                    </Box>

                                    {/* 송장 정보 표시 */}
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

                                    {/* 송장번호 등록 버튼 */}
                                    {supply.status === 'pending' && (
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                variant="contained" 
                                                size="small"
                                                onClick={() => handleTrackingClick(supply)}
                                            >
                                                송장번호 등록
                                            </Button>
                                        </Box>
                                    )}
                                    
                                    {supply.supplier_message && (
                                        <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                메시지: {supply.supplier_message}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* 송장번호 등록 다이얼로그 */}
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
        </Box>
    );
}