import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip, Alert, Tabs, Tab } from '@mui/material';
import { getAllReliefRequests, addReliefSupplySimple, getUserDonationItems } from "../services/reliefService";
import { useAuthStore } from "../store/authStore";
import { RequestDetailDialog } from '../components/RequestDetailDialog';
import { AcceptedDialog } from '../components/AcceptedDialog';
// import TutorialMain from "../components/tutorials/main";
import { LoadingState } from "../components/common/LoadingState";

export function Supply() {
    const [allRequests, setAllRequests] = useState([]);
    const [userDonations, setUserDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [supplying, setSupplying] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [acceptedDialogOpen, setAcceptedDialogOpen] = useState(false);
    const [tutorialOpen, setTutorialOpen] = useState(true);
    const [activeTab, setActiveTab] = useState(0); // 0: 매칭결과, 1: 전체결과
    
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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // 문자열 유사도 계산 (Jaccard 유사도 기반)
    const calculateSimilarity = (str1, str2) => {
        const normalize = (str) => str.toLowerCase().replace(/[^가-힣a-z0-9]/g, '');
        const s1 = normalize(str1);
        const s2 = normalize(str2);
        
        // 완전 일치
        if (s1 === s2) return 1;
        
        // 포함 관계 확인
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;
        
        // 2-gram 기반 유사도
        const getBigrams = (str) => {
            const bigrams = new Set();
            for (let i = 0; i < str.length - 1; i++) {
                bigrams.add(str.substring(i, i + 2));
            }
            return bigrams;
        };
        
        const bigrams1 = getBigrams(s1);
        const bigrams2 = getBigrams(s2);
        
        const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
        const union = new Set([...bigrams1, ...bigrams2]);
        
        return union.size === 0 ? 0 : intersection.size / union.size;
    };

    // 사용자 희망 기부 물품과 매칭 정도 확인
    const getMatchingLevel = (request) => {
        if (!userDonations || userDonations.length === 0) return 'none';
        
        let maxSimilarity = 0;
        userDonations.forEach(donation => {
            const similarity = calculateSimilarity(donation.item_name, request.item_name);
            maxSimilarity = Math.max(maxSimilarity, similarity);
        });
        
        if (maxSimilarity >= 0.7) return 'exact';
        if (maxSimilarity >= 0.4) return 'similar';
        return 'none';
    };

    // 기존 함수 호환성 유지
    const isMatchingRequest = (request) => {
        return getMatchingLevel(request) !== 'none';
    };

    if (loading) {
        return <LoadingState message="구호품 요청을 불러오는 중..." />;
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
                {/* <TutorialMain
                open={tutorialOpen}
                onClose={() => setTutorialOpen(false)} 
                /> */}
            </Box>
            
        );
    }

    if (allRequests.length === 0) {
        return (
            <Box>
                
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
                <TutorialMain
                open={tutorialOpen}
                onClose={() => setTutorialOpen(false)} 
                />
            </Box>
        );
    }

    // 요청 목록을 매칭 여부에 따라 분리
    const matchedRequests = allRequests.filter(request => getMatchingLevel(request) !== 'none');
    const otherRequests = allRequests.filter(request => getMatchingLevel(request) === 'none');

    // 요청 아이템 렌더링 함수
    const renderRequestItem = (request, index, totalLength) => (
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
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1}}>
                    {(() => {
                        const matchLevel = getMatchingLevel(request);
                        switch (matchLevel) {
                            case 'exact':
                                return "내가 현재 가지고 있는 물품이에요";
                            case 'similar':
                                return "유사한 품목입니다";
                            default:
                                return "인근 대피소에서 필요로 하고 있어요";
                        }
                    })()} 
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {request.shelter?.shelter_name || '대피소 정보 없음'}
                </Typography>
                
                {request.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {request.description}
                    </Typography>
                )}
            </Box>
            
            {/* 마지막 아이템이 아닌 경우에만 구분선 표시 */}
            {index < totalLength - 1 && (
                <Box sx={{ 
                    height: '1px', 
                    backgroundColor: 'divider'
                }} />
            )}
        </Box>
    );

    return (
        <Box>
            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2,  }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="구호품 요청 탭">
                    <Tab 
                        label={`🎯 매칭결과 (${matchedRequests.length})`} 
                        sx={{ fontWeight: 'bold', minWidth:'50%' }}
                    />
                    <Tab 
                        label={`📋 전체 결과 (${allRequests.length})`} 
                        sx={{ fontWeight: 'bold', minWidth:'50%' }}
                    />
                </Tabs>
            </Box>

            {/* 탭 컨텐츠 */}
            {activeTab === 0 && (
                <Box>
                    {matchedRequests.length === 0 ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            minHeight: '300px',
                            flexDirection: 'column',
                            gap: 2
                        }}>
                            <Typography variant="h6" color="text.secondary">
                                매칭된 구호품 요청이 없습니다
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                먼저 '내 정보' 페이지에서 기부하고 싶은 물품을 등록해주세요
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {matchedRequests.map((request, index) => 
                                renderRequestItem(request, index, matchedRequests.length)
                            )}
                        </Box>
                    )}
                </Box>
            )}

            {activeTab === 1 && (
                <Box>
                    {allRequests.length === 0 ? (
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
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {allRequests.map((request, index) => 
                                renderRequestItem(request, index, allRequests.length)
                            )}
                        </Box>
                    )}
                </Box>
            )}

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

            {/* <TutorialMain
                open={tutorialOpen}
                onClose={() => setTutorialOpen(false)} 
            /> */}
        </Box>
    );
}