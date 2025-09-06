import { useState } from "react";
import { Box, Typography, Chip, Tabs, Tab } from '@mui/material';
import { RequestDetailDialog } from '../components/dialogs/RequestDetailDialog';
import { AcceptedDialog } from '../components/dialogs/AcceptedDialog';
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from '../components/common/ErrorState.jsx';
import { EmptyState } from "../components/common/EmptyState.jsx";
import { useReliefRequests } from "../hooks/useReliefRequests";
import { filterRequestsByMatching } from "../utils/requestUtils";
import RequestList from "../components/supply/RequestList.jsx";

export default function Supply() {
    const {
        allRequests, userDonations, loading, error, supplying,
        loadAllRequests, handleAccept
    } = useReliefRequests();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [acceptedDialogOpen, setAcceptedDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: 매칭결과, 1: 전체결과

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
    // 기부 물품 미등록 상태
    if (userDonations.length === 0)
        return <EmptyState title="희망 기부 물품이 등록되지 않았습니다" description="먼저 '내 정보' 페이지에서 기부하고 싶은 물품을 등록해주세요" />;
    // 구호품 요청 없음
    if (allRequests.length === 0) {
        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>내 희망 기부 물품</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {userDonations.map((donation) => (
                            <Chip key={donation.id} label={donation.item_name} color="primary" variant="outlined" size="small" />
                        ))}
                    </Box>
                </Box>
                <EmptyState title="현재 구호품 요청이 없습니다" description="등록된 구호품 요청이 없습니다" actionLabel="새로고침" onAction={loadAllRequests} />
            </Box>
        );
    }

    // 매칭된 요청 필터링
    const { matched: matchedRequests } = filterRequestsByMatching(allRequests, userDonations);

    return (
        <Box>
            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="구호품 요청 탭">
                    <Tab label={`🎯 매칭결과 (${matchedRequests.length})`} sx={{ fontWeight: 'bold', minWidth: '50%' }} />
                    <Tab label={`📋 전체 결과 (${allRequests.length})`} sx={{ fontWeight: 'bold', minWidth: '50%' }} />
                </Tabs>
            </Box>

            {/* 탭 컨텐츠 */}
            {activeTab === 0
                ? (matchedRequests.length === 0
                    ? <EmptyState title="매칭된 구호품 요청이 없습니다" description="먼저 '내 정보' 페이지에서 기부하고 싶은 물품을 등록해주세요" />
                    : <RequestList requests={matchedRequests} onRequestClick={handleRequestClick} />)
                : (allRequests.length === 0
                    ? <EmptyState title="현재 구호품 요청이 없습니다" description="등록된 구호품 요청이 없습니다" actionLabel="새로고침" onAction={loadAllRequests} />
                    : <RequestList requests={allRequests} onRequestClick={handleRequestClick} />)
            }

            {/* 구호품 요청 상세정보 다이얼로그 */}
            <RequestDetailDialog open={detailDialogOpen} onClose={handleDetailDialogClose} onAccept={onAccept} request={selectedRequest} loading={supplying} />

            {/* 접수 완료 알림 다이얼로그 */}
            <AcceptedDialog open={acceptedDialogOpen} onClose={handleAcceptedDialogClose} />
        </Box>
    );
}
