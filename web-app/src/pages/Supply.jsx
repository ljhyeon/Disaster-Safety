import { useState } from "react";
import { Box, Alert, Tabs, Tab } from '@mui/material';
import { RequestDetailDialog } from '../components/dialogs/RequestDetailDialog';
import { AcceptedDialog } from '../components/dialogs/AcceptedDialog';
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from '../components/common/ErrorState.jsx';
import { EmptyState } from "../components/common/EmptyState.jsx";
import { useReliefRequests } from "../hooks/useReliefRequests";
import { filterRequestsByMatching } from "../utils/requestUtils";
import RequestList from "../components/supply/RequestList.jsx";
import RecommandList from "../components/supply/RecommandList.jsx";

export default function Supply() {
    const {
        allRequests, userDonations, loading, error, supplying,
        loadAllRequests, handleAccept
    } = useReliefRequests();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [acceptedDialogOpen, setAcceptedDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: 전체목록, 1: 추천목록 (매칭결과)

    // 요청 클릭 시 상세 다이얼로그 오픈
    const handleRequestClick = (request) => { setSelectedRequest(request); setDetailDialogOpen(true); };

    // 상세 다이얼로그 닫기
    const handleDetailDialogClose = () => { if (!supplying) { setDetailDialogOpen(false); setSelectedRequest(null); } };

    // 접수 완료 다이얼로그 닫기
    const handleAcceptedDialogClose = () => { setAcceptedDialogOpen(false); setSelectedRequest(null); };

    // 탭 변경
    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    // 요청 접수 처리
    const onAccept = async (acceptData) => {
        try {
            const result = await handleAccept(selectedRequest, acceptData);
            if (result.success) { setDetailDialogOpen(false); setAcceptedDialogOpen(true); }
        } catch (err) { alert(`접수 실패: ${err.message}`); }
    };

    // 로딩 상태
    if (loading) return <LoadingState message="구호품 요청을 불러오는 중..." />;
    // 에러 상태
    if (error) return <ErrorState error={error} onRetry={loadAllRequests} />;

    // 매칭된 요청 필터링
    const { matched: matchedRequests } = filterRequestsByMatching(allRequests, userDonations);

    console.log(matchedRequests)

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="구호품 요청 탭">
                    <Tab label='전체 목록' sx={{ minWidth: '50%' }} />
                    <Tab label='추천 목록' sx={{ minWidth: '50%' }} />
                </Tabs>
            </Box>

            {/* 탭 컨텐츠 */}
            <Box sx={{ flex: 1,  overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
                {activeTab === 0
                    ? (allRequests.length === 0
                        ? <EmptyState title="등록된 정보가 없습니다" description="아직 등록된 구호품이 없어요." />
                        : <RequestList requests={allRequests} onRequestClick={handleRequestClick} />)
                    : (matchedRequests.length === 0
                        ? <EmptyState 
                            title="등록된 정보가 없습니다" 
                            description={`내 정보 페이지에서
                        기부할 구호품을 등록해주세요.`} 
                        />
                        : (
                            <>
                                <Alert
                                    severity="info"
                                    sx={{ mx: 2, my: 1, borderRadius: '8px', border: '1px solid #BFDBFE', color: '#1E40AF' }}
                                >
                                    매칭된 구호품은 가장 가까운 대피소와 우선 순위에 따라 정렬되었습니다.
                                </Alert>
                                <RecommandList requests={matchedRequests} onRequestClick={handleRequestClick} />
                            </>
                        ))
                }
            </Box>

            {/* 구호품 요청 상세정보 다이얼로그 */}
            <RequestDetailDialog open={detailDialogOpen} onClose={handleDetailDialogClose} onAccept={onAccept} request={selectedRequest} loading={supplying} />

            {/* 접수 완료 알림 다이얼로그 */}
            <AcceptedDialog open={acceptedDialogOpen} onClose={handleAcceptedDialogClose} />
        </Box>
    );
}
