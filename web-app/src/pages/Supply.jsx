import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { LocationOn, Schedule, Flag } from '@mui/icons-material';

import { InfoDialog } from "../components/InfoDialog";
import { CheckDialog } from "../components/CheckDialog";
import { getMatchingReliefRequests, addReliefSupplySimple, RELIEF_PRIORITY } from "../services/reliefService";
import { getShelter } from "../services/shelterService";
import { useAuthStore } from "../store/authStore";
import { useShelterStore } from "../store/shelterStore";
import { RequestDetailDialog } from '../components/RequestDetailDialog';
import { AcceptedDialog } from '../components/AcceptedDialog';

export function Supply() {
    const { shelterId } = useParams();
    const [matchingRequests, setMatchingRequests] = useState([]);
    const [userDonations, setUserDonations] = useState([]);
    const [shelter, setShelter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [checkOpen, setCheckOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [supplying, setSupplying] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [acceptedDialogOpen, setAcceptedDialogOpen] = useState(false);
    
    const { user } = useAuthStore();
    const { shelterInfo } = useShelterStore();

    // 매칭 구호품 요청 목록 로드
    useEffect(() => {
        if (user) {
            loadMatchingRequests();
        }
    }, [user]);

    const loadMatchingRequests = async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        
        try {
            console.log('📦 Supply 매칭 요청 조회 시작');
            const result = await getMatchingReliefRequests(user.uid);
            
            if (result.success) {
                setMatchingRequests(result.requests || []);
                setUserDonations(result.userDonations || []);
                console.log('✅ 매칭된 구호품 요청 수:', result.requests?.length || 0);
                console.log('✅ 사용자 희망 기부 물품 수:', result.userDonations?.length || 0);
            } else {
                console.error('❌ 매칭 요청 조회 실패:', result.error);
                setError(result.error?.message || '매칭되는 구호품 요청을 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ 매칭 요청 조회 중 오류:', error);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
        setDetailDialogOpen(true);
    };

    // 배송 확인 처리
    const handleConfirmDelivery = () => {
        setCheckOpen(false);
        setOpen(true);
    };

    // 구호품 공급 제출
    const handleSupplySubmit = async (supplyData) => {
        if (!selectedRequest || !user) return;

        setSupplying(true);
        
        try {
            const result = await addReliefSupply({
                requestId: selectedRequest.id,
                supplierName: supplyData.supplierName,
                supplierPhone: supplyData.supplierPhone,
                supplierEmail: supplyData.supplierEmail,
                quantity: parseInt(supplyData.quantity),
                message: supplyData.message,
                userId: user.uid
            });

            if (result.success) {
                setOpen(false);
                alert('접수되었습니다. [기부 배송] 페이지에서 송장번호를 입력해주세요.');
                // 목록 새로고침
                loadMatchingRequests();
            } else {
                alert(`구호품 공급 등록 실패: ${result.error.message}`);
            }
        } catch (err) {
            alert('구호품 공급 등록 중 오류가 발생했습니다.');
            console.error('구호품 공급 실패:', err);
        } finally {
            setSupplying(false);
        }
    };

    // 우선순위 색상 매핑
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'error';
            case 'high':
                return 'warning';
            case 'normal':
            case 'medium':
                return 'info';
            case 'low':
                return 'success';
            default:
                return 'default';
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

    const handleAccept = async () => {
        if (!selectedRequest || !user) return;
        
        setSupplying(true);
        try {
            const result = await addReliefSupplySimple(selectedRequest.request_id, user.uid, {
                item_name: selectedRequest.item_name,
                quantity: selectedRequest.quantity,
                unit: selectedRequest.unit,
                category: selectedRequest.category,
                subcategory: selectedRequest.subcategory,
                priority: selectedRequest.priority,
                notes: selectedRequest.notes || '',
                shelter_id: selectedRequest.shelter_id
            });

            if (result.success) {
                setDetailDialogOpen(false);
                setAcceptedDialogOpen(true);
                // 목록 새로고침
                loadMatchingRequests();
            } else {
                alert(`접수 실패: ${result.error.message}`);
            }
        } catch (error) {
            console.error('접수 처리 중 오류:', error);
            alert('접수 처리 중 오류가 발생했습니다.');
        } finally {
            setSupplying(false);
        }
    };

    const handleDetailDialogClose = () => {
        if (!supplying) {
            setDetailDialogOpen(false);
            setSelectedRequest(null);
        }
    };

    const handleAcceptedDialogClose = () => {
        setAcceptedDialogOpen(false);
        setSelectedRequest(null);
    };

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
                <Typography>매칭되는 구호품 요청을 찾는 중...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="outlined" onClick={loadMatchingRequests}>
                    다시 시도
                </Button>
            </Box>
        );
    }

    if (userDonations.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
                    구호품 공급하기
                </Typography>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '300px',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <Typography variant="h6" color="text.secondary">
                        희망 기부 물품이 등록되지 않았습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        먼저 '내 정보' 페이지에서 기부하고 싶은 물품을 등록해주세요
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (matchingRequests.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
                    구호품 공급하기
                </Typography>
                
                {/* 사용자 희망 기부 물품 표시 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        내 희망 기부 물품
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {userDonations.map((donation) => (
                            <Chip 
                                key={donation.id}
                                label={`${donation.item_name} ${donation.quantity}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '300px',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <Typography variant="h6" color="text.secondary">
                        현재 매칭되는 구호품 요청이 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        등록하신 희망 기부 물품과 일치하는 구호품 요청이 없습니다
                    </Typography>
                    <Button variant="outlined" onClick={loadMatchingRequests}>
                        새로고침
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {/* 헤더 */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
                            구호품 공급하기
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            내 희망 기부 물품과 매칭되는 구호품 요청
                        </Typography>
                    </Box>
                    <Button variant="outlined" size="small" onClick={loadMatchingRequests}>
                        새로고침
                    </Button>
                </Box>
                
                {/* 사용자 희망 기부 물품 표시 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        내 희망 기부 물품
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {userDonations.map((donation) => (
                            <Chip 
                                key={donation.id}
                                label={`${donation.item_name} ${donation.quantity}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ 
                    p: 2,
                    bgcolor: 'success.light',
                    borderRadius: 1,
                    color: 'success.contrastText'
                }}>
                    <Typography variant="body2">
                        💡 총 {matchingRequests.length}개의 매칭되는 구호품 요청이 있습니다
                    </Typography>
                </Box>
            </Box>

            {/* 구호품 요청 목록 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {matchingRequests.map((request) => (
                    <Card 
                        key={request.id} 
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => handleRequestClick(request)}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                                        {request.item_name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationOn fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {request.shelter?.shelter_name || '대피소 정보 없음'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Schedule fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(request.created_at)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                    <Chip 
                                        label={request.priority}
                                        color={getPriorityColor(request.priority)}
                                        size="small"
                                        icon={<Flag fontSize="small" />}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {request.quantity} {request.unit}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label={request.category}
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip 
                                        label={request.subcategory}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                                <Button 
                                    variant="contained" 
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequestClick(request);
                                    }}
                                >
                                    상세보기
                                </Button>
                            </Box>
                            
                            {request.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {request.description}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* 구호품 요청 상세정보 다이얼로그 */}
            <RequestDetailDialog
                open={detailDialogOpen}
                onClose={handleDetailDialogClose}
                onAccept={handleAccept}
                request={selectedRequest}
                loading={supplying}
            />

            {/* 접수 완료 알림 다이얼로그 */}
            <AcceptedDialog
                open={acceptedDialogOpen}
                onClose={handleAcceptedDialogClose}
            />
        </Box>
    );
}