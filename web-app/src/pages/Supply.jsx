import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { getAllReliefRequests, addReliefSupplySimple, getUserDonationItems } from "../services/reliefService";
import { useAuthStore } from "../store/authStore";
import { RequestDetailDialog } from '../components/RequestDetailDialog';
import { AcceptedDialog } from '../components/AcceptedDialog';

export function Supply() {
    const [allRequests, setAllRequests] = useState([]);
    const [userDonations, setUserDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [supplying, setSupplying] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [acceptedDialogOpen, setAcceptedDialogOpen] = useState(false);
    
    const { user } = useAuthStore();

    // 모든 구호품 요청 목록 로드
    useEffect(() => {
        if (user) {
            loadAllRequests();
        }
    }, [user]);

    const loadAllRequests = async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        
        try {
            console.log('📦 Supply 모든 요청 조회 시작');
            
            // 모든 구호품 요청 조회
            const allRequestsResult = await getAllReliefRequests();
            
            // 사용자 희망 기부 물품 조회
            const userDonationsResult = await getUserDonationItems(user.uid);
            
            if (allRequestsResult.success) {
                setAllRequests(allRequestsResult.requests || []);
                console.log('✅ 모든 구호품 요청 수:', allRequestsResult.requests?.length || 0);
            } else {
                console.error('❌ 구호품 요청 조회 실패:', allRequestsResult.error);
                setError('구호품 요청을 불러올 수 없습니다.');
            }
            
            if (userDonationsResult.success) {
                setUserDonations(userDonationsResult.donations || []);
                console.log('✅ 사용자 희망 기부 물품 수:', userDonationsResult.donations?.length || 0);
            } else {
                console.warn('⚠️ 사용자 희망 기부 물품 조회 실패:', userDonationsResult.error);
                setUserDonations([]);
            }
        } catch (error) {
            console.error('❌ 요청 조회 중 오류:', error);
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
                loadAllRequests();
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

    const handleAccept = async (acceptData) => {
        if (!selectedRequest || !user || !acceptData?.quantity) return;
        
        setSupplying(true);
        try {
            const result = await addReliefSupplySimple(selectedRequest.request_id, user.uid, {
                item_name: selectedRequest.item_name,
                quantity: acceptData.quantity, // 사용자가 입력한 공급 수량
                requested_quantity: selectedRequest.quantity, // 원래 요청 수량
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
                loadAllRequests();
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

    // 사용자 희망 기부 물품과 매칭되는지 확인
    const isMatchingRequest = (request) => {
        if (!userDonations || userDonations.length === 0) return false;
        
        return userDonations.some(donation => 
            donation.item_name.toLowerCase().includes(request.item_name.toLowerCase()) ||
            request.item_name.toLowerCase().includes(donation.item_name.toLowerCase())
        );
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
                <Typography>구호품 요청을 불러오는 중...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="outlined" onClick={loadAllRequests}>
                    다시 시도
                </Button>
            </Box>
        );
    }

    if (userDonations.length === 0) {
        return (
            <Box>
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

    if (allRequests.length === 0) {
        return (
            <Box>
                <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
                    구호품 공급하기
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        내 희망 기부 물품
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {userDonations.map((donation) => (
                            <Chip 
                                key={donation.id}
                                label={donation.item_name}
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
                        현재 구호품 요청이 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        등록된 구호품 요청이 없습니다
                    </Typography>
                    <Button variant="outlined" onClick={loadAllRequests}>
                        새로고침
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {allRequests.map((request, index) => (
                    <Box key={request.id}>
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
                            onClick={() => handleRequestClick(request)}
                        >
                            <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                {request.item_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1, fontWeight: 'bold' }}>
                                {isMatchingRequest(request) 
                                    ? "내가 현재 가지고 있는 물품이에요" 
                                    : "가장 가까운 곳에 위치한 대피소에서 필요로 하고 있어요"
                                }
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {request.shelter?.shelter_name || '대피소 정보 없음'}
                            </Typography>
                            
                            {request.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {request.description}
                                </Typography>
                            )}
                        </Box>
                        
                        {/* 마지막 아이템이 아닌 경우에만 구분선 표시 */}
                        {index < allRequests.length - 1 && (
                            <Box sx={{ 
                                height: '1px', 
                                backgroundColor: 'divider'
                            }} />
                        )}
                    </Box>
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