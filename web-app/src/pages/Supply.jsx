import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { LocationOn, Schedule, Flag } from '@mui/icons-material';

import { InfoDialog } from "../components/InfoDialog";
import { CheckDialog } from "../components/CheckDialog";
import { getAllReliefRequests, addReliefSupply, RELIEF_PRIORITY } from "../services/reliefService";
import { useAuthStore } from "../store/authStore";

export function Supply() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [checkOpen, setCheckOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [supplying, setSupplying] = useState(false);
    
    const { user } = useAuthStore();

    // 구호품 요청 목록 로드
    useEffect(() => {
        loadReliefRequests();
    }, []);

    const loadReliefRequests = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getAllReliefRequests();
            if (result.success) {
                setRequests(result.requests);
            } else {
                setError(result.error.message);
            }
        } catch (err) {
            setError('구호품 요청 목록을 불러오는 중 오류가 발생했습니다.');
            console.error('구호품 요청 로드 실패:', err);
        } finally {
            setLoading(false);
        }
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
                setCheckOpen(true);
                // 목록 새로고침
                loadReliefRequests();
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

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
        setOpen(true);
    };

    // 우선순위 색상 매핑
    const getPriorityColor = (priority) => {
        switch (priority) {
            case RELIEF_PRIORITY.URGENT:
                return 'error';
            case RELIEF_PRIORITY.HIGH:
                return 'warning';
            case RELIEF_PRIORITY.MEDIUM:
                return 'info';
            case RELIEF_PRIORITY.LOW:
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
                <Typography>구호품 요청 목록을 불러오는 중...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="outlined" onClick={loadReliefRequests}>
                    다시 시도
                </Button>
            </Box>
        );
    }

    if (requests.length === 0) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography variant="h6" color="text.secondary">
                    현재 구호품 요청이 없습니다
                </Typography>
                <Button variant="outlined" onClick={loadReliefRequests}>
                    새로고침
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {/* 헤더 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h1">
                    구호품 공급하기
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        총 {requests.length}개의 요청
                    </Typography>
                    <Button variant="outlined" size="small" onClick={loadReliefRequests}>
                        새로고침
                    </Button>
                </Box>
            </Box>

            {/* 구호품 요청 목록 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {requests.map((request) => (
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
                                    공급하기
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

            {/* 구호품 공급 정보 입력 다이얼로그 */}
            <InfoDialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleSupplySubmit}
                title="구호품 공급 정보"
                shelter={selectedRequest?.shelter?.shelter_name || ''}
                address={selectedRequest?.shelter?.location || ''}
                item={selectedRequest?.item_name || ''}
                quantity={selectedRequest?.quantity || ''}
                unit={selectedRequest?.unit || ''}
                priority={selectedRequest?.priority || ''}
                category={selectedRequest?.category || ''}
                subcategory={selectedRequest?.subcategory || ''}
                description={selectedRequest?.description || ''}
                loading={supplying}
            />
            
            {/* 공급 완료 확인 다이얼로그 */}
            <CheckDialog 
                open={checkOpen}
                onClose={() => setCheckOpen(false)}
            />
        </Box>
    );
}