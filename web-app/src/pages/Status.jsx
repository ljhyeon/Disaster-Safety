import { useState } from 'react';
import { Box, Typography, Chip, Alert, Button, } from '@mui/material';
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from '../components/common/ErrorState.jsx';
import { TrackingDialog } from '../components/dialog/TrackingDialog';
import { TrackingViewDialog } from '../components/dialog/TrackingViewDialog.jsx';
import { SupplyList } from '../components/supply/SupplyList';
import { useUserSupplies } from '../hooks/useUserSupplies';

export function Status() {
    const {
        supplies,
        loading,
        error,
        submitting,
        loadSupplies,
        handleTrackingSubmit
    } = useUserSupplies();

    const [trackingOpen, setTrackingOpen] = useState(false);
    const [trackingViewOpen, setTrackingViewOpen] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState(null);

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

    if (loading) {
        return <LoadingState message="공급 이력을 불러오는 중..." />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={loadSupplies} />;
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
                <SupplyList supplies={supplies} onTrackingClick={handleTrackingClick} />
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