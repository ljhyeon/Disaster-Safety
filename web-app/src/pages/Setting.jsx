import { useState } from 'react';
import { Box, Typography, IconButton, Alert, Button } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import { Form2Dialog } from '../components/dialogs/Form2Dialog';
import { AddressDialog } from '../components/dialogs/AddressDialog';
import { LoadingState } from '../components/common/LoadingState';
import { useUserDonations } from '../hooks/useUserDonations';

export default function Setting() {
    const { donations, loading, error, submitting, loadDonations, handleSubmit, handleDelete } = useUserDonations();
    const [open, setOpen] = useState(false); // 기부 물품 Dialog
    const [addressOpen, setAddressOpen] = useState(false); // 주소 Dialog
    const [address, setAddress] = useState('내 주소');
    const handleAddressSubmit = (newAddress) => setAddress(newAddress);

    if (loading) return <LoadingState message='희망 기부 물품을 불러오는 중...' />;

    return (
        <Box p={2}>
            {/* 내 정보 */}
            <Typography variant="h6" fontWeight="bold">내 정보</Typography>
            <Box display="flex" alignItems="center" gap={1} mb={2} onClick={() => setAddressOpen(true)} sx={{ cursor: 'pointer' }}>
                <Typography variant="body1">📍 {address}</Typography>
            </Box>

            {/* 희망 기부 물품 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">희망 기부 물품</Typography>
                <Button variant="outlined" size="small" onClick={loadDonations}>새로고침</Button>
            </Box>

            {/* 에러 메시지 */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* 기부 물품 리스트 */}
            <Box display="flex" flexDirection="column" gap={1} mb={4}>
                {donations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        등록된 희망 기부 물품이 없습니다.
                    </Typography>
                ) : (
                    donations.map((donation) => (
                        <Box key={donation.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Typography variant="body1">{donation.item_name}</Typography>
                            <IconButton size="small" onClick={() => handleDelete(donation.id)} sx={{ color: 'error.main' }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))
                )}
            </Box>

            {/* 기부 물품 추가 버튼 */}
            <Box display="flex" justifyContent="center" alignItems="center" position="relative">
                <ControlPointRoundedIcon sx={{ width: 48, height: 48, cursor: 'pointer' }} onClick={() => setOpen(true)} />
            </Box>

            {/* 기부 물품 등록 Dialog */}
            <Form2Dialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={async ({ item }) => {
                    const result = await handleSubmit(item);
                    if (result?.success) setOpen(false);
                }}
                label1="물품명"
                commnet="기부하고 싶은 물품을 입력해주세요"
                loading={submitting}
                itemOnly={true}
            />

            {/* 주소 변경 Dialog */}
            <AddressDialog open={addressOpen} onClose={() => setAddressOpen(false)} onSubmit={handleAddressSubmit} />
        </Box>
    );
}
