import { useState } from 'react';
import { Box, Typography, IconButton, Alert, Button } from '@mui/material';
import { LoadingState } from '../components/common/LoadingState';
import { useUserDonations } from '../hooks/useUserDonations';
import { EmptyState } from "../components/common/EmptyState.jsx";
import { AddDialog } from '../components/dialogs/AddDialog.jsx';
import WishList from '../components/setting/WishList.jsx';
import RoomIcon from '@mui/icons-material/Room';
import { useAuthStore } from '../store/authStore';

export default function Setting() {
    const { donations, loading, error, submitting, loadDonations, handleSubmit, handleDelete } = useUserDonations();
    const [open, setOpen] = useState(false); // 기부 물품 Dialog
    const { user } = useAuthStore();

    // user에서 주소 정보 가져오기
    const road_address = user?.road_address || '주소 정보가 없습니다';
    const address_detail = user?.address_detail || '';

    if (loading) return <LoadingState message='희망 기부 물품을 불러오는 중...' />;

    if (donations.length === 0) {
        return (
            <Box p={2} display='flex' flexDirection='column' justifyContent='space-between' minHeight='100%'>
            <Box sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', p: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RoomIcon sx={{ fontSize: 10, color: '#666666' }} />
                    <Typography sx={{ fontSize: 10, color: '#666666'}}>{road_address} {address_detail}</Typography>  {/* 대구광역시 북구 산격동 123-12 */}
                </Box>
                <Typography variant='subtitle1'>내가 보유한 물품 현황</Typography>
                <Typography variant='body2'>보유 중인 구호품을 확인할 수 있습니다</Typography>
            </Box>

            {/* 에러 메시지 */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* 기부 물품 리스트 */}
            <Box display="flex" flexDirection="column" gap={1} mb={4}>
                <EmptyState title="등록된 정보가 없습니다" description="아직 보유한 구호품이 없어요." />
            </Box>

            {/* 기부 물품 추가 버튼 */}
            <Button variant='contained' fullWidth onClick={() => setOpen(true)}>추가  </Button>

            {/* 기부 물품 등록 Dialog */}
            <AddDialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={async ({ item }) => {
                        const result = await handleSubmit(item);
                        if (result?.success) setOpen(false);
                    }}
            />

        </Box>
        )
    }

    return (
        <Box p={2}>
            <Box sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', p: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RoomIcon sx={{ fontSize: 10, color: '#666666' }} />
                    <Typography sx={{ fontSize: 10, color: '#666666'}}>{road_address} {address_detail}</Typography>  {/* 대구광역시 북구 산격동 123-12 */}
                </Box>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold'}}>내가 보유한 물품 현황</Typography>
                <Typography variant='body2'>보유 중인 구호품을 확인할 수 있습니다</Typography>
            </Box>

            {/* 에러 메시지 */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* 기부 물품 리스트 */}
            <Box display="flex" flexDirection="column" gap={1} mb={4}>
                <WishList donations={donations} handleDelete={handleDelete}/>
            </Box>

            {/* 기부 물품 추가 버튼 */}
            <Button variant='contained' fullWidth onClick={() => setOpen(true)}>추가  </Button>

            {/* 기부 물품 등록 Dialog */}
            <AddDialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={async ({ item }) => {
                        const result = await handleSubmit(item);
                        if (result?.success) setOpen(false);
                    }}
            />

        </Box>
    );
}
