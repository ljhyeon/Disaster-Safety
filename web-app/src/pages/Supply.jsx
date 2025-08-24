import { useState, } from "react";
import { Box, Typography, Button, Chip, Alert, Tabs, Tab } from '@mui/material';
import { RequestDetailDialog } from '../components/dialog/RequestDetailDialog';
import { AcceptedDialog } from '../components/dialog/AcceptedDialog';
import { LoadingState } from "../components/common/LoadingState";
import { useReliefRequests } from "../hooks/useReliefRequests";
import { getMatchingLevel, filterRequestsByMatching } from "../utils/requestUtils";

export function Supply() {
    const {
        allRequests,
        userDonations,
        loading,
        error,
        supplying,
        loadAllRequests,
        handleAccept
    } = useReliefRequests();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [acceptedDialogOpen, setAcceptedDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: 매칭결과, 1: 전체결과

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
        setDetailDialogOpen(true);
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

     const onAccept = async (acceptData) => {
        try {
            const result = await handleAccept(selectedRequest, acceptData);
            if (result.success) {
                setDetailDialogOpen(false);
                setAcceptedDialogOpen(true);
            }
        } catch (err) {
            alert(`접수 실패: ${err.message}`);
        }
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
            </Box>
        );
    }

    const { matched: matchedRequests } = filterRequestsByMatching(allRequests, userDonations);

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
                onAccept={onAccept}
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