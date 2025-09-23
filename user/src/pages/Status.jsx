import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from '../components/common/ErrorState.jsx';
import { TrackingDialog } from '../components/dialogs/TrackingDialog';
import { TrackingViewDialog } from '../components/dialogs/TrackingViewDialog.jsx';
import { SupplyList } from '../components/supply/SupplyList';
import { useUserSupplies } from '../hooks/useUserSupplies';
import { EmptyState } from '../components/common/EmptyState.jsx';

export default function Status() {
    const { supplies, loading, error, submitting, loadSupplies, handleTrackingSubmit } = useUserSupplies();
    const [trackingOpen, setTrackingOpen] = useState(false);
    const [trackingViewOpen, setTrackingViewOpen] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState(null);

    // 송장번호 등록/조회 모달 열기
    const handleTrackingClick = (supply) => {
        setSelectedSupply(supply);
        supply.courier_company && supply.tracking_number ? setTrackingViewOpen(true) : setTrackingOpen(true);
    };

    // 송장번호 제출 핸들러 (모달 닫기 포함)
    const handleSubmitTracking = async (trackingData) => {
        const result = await handleTrackingSubmit(selectedSupply.id, trackingData);
        if (result?.success) {
            setTrackingOpen(false); // 성공 시 모달 닫기
            setSelectedSupply(null); // 선택된 supply 초기화
        }
    };

    if (loading) return <LoadingState message="공급 이력을 불러오는 중..." />;
    if (error) return <ErrorState error={error} onRetry={loadSupplies} />;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {supplies.length === 0 ? (
                <EmptyState title="등록된 구호품이 없습니다" description="필요 물품을 확인하고 등록해 보세요." />
            ) : (
                <SupplyList supplies={supplies} onTrackingClick={handleTrackingClick} />
            )}

            <TrackingDialog
                open={trackingOpen}
                onClose={() => {
                    setTrackingOpen(false);
                    setSelectedSupply(null);
                }}
                onSubmit={handleSubmitTracking}
                item={selectedSupply?.item_name}
                quantity={selectedSupply?.supplied_quantity}
                unit={selectedSupply?.unit}
                loading={submitting}
            />

            {/* <TrackingViewDialog
                open={trackingViewOpen}
                onClose={() => setTrackingViewOpen(false)}
                supply={selectedSupply}
            /> */}
        </Box>
    );
}
