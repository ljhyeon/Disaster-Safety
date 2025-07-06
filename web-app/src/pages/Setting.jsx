import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, CircularProgress, Alert, Button } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import { Form2Dialog } from '../components/Form2Dialog';
import { AddressDialog } from '../components/AddressDialog';
import { addUserDonationItem, getUserDonationItems, deleteUserDonationItem } from '../services/reliefService';
import { useAuthStore } from '../store/authStore';

export function Setting() {
    const [open, setOpen] = useState(false);      // 기부 물품 Dialog
    const [addressOpen, setAddressOpen] = useState(false); // 주소 Dialog
    const [address, setAddress] = useState('내 주소');
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const { user } = useAuthStore();

    // 희망 기부 물품 목록 로드
    useEffect(() => {
        if (user) {
            loadDonations();
        }
    }, [user]);

    const loadDonations = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getUserDonationItems(user.uid);
            if (result.success) {
                setDonations(result.donations);
            } else {
                setError(result.error.message);
            }
        } catch (err) {
            setError('희망 기부 물품을 불러오는 중 오류가 발생했습니다.');
            console.error('기부 물품 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async ({ item }) => {
        if (!user) return;
        
        setSubmitting(true);
        
        try {
            const result = await addUserDonationItem(user.uid, { item });
            if (result.success) {
                setOpen(false);
                loadDonations(); // 목록 새로고침
            } else {
                alert(`기부 물품 등록 실패: ${result.error.message}`);
            }
        } catch (err) {
            alert('기부 물품 등록 중 오류가 발생했습니다.');
            console.error('기부 물품 등록 실패:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (donationId) => {
        if (!confirm('이 기부 물품을 삭제하시겠습니까?')) return;
        
        try {
            const result = await deleteUserDonationItem(donationId);
            if (result.success) {
                loadDonations(); // 목록 새로고침
            } else {
                alert(`기부 물품 삭제 실패: ${result.error.message}`);
            }
        } catch (err) {
            alert('기부 물품 삭제 중 오류가 발생했습니다.');
            console.error('기부 물품 삭제 실패:', err);
        }
    };

    const handleAddressSubmit = (newAddress) => {
        setAddress(newAddress);
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
                <Typography>희망 기부 물품을 불러오는 중...</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h6" fontWeight="bold">내 정보</Typography>

            <Box display="flex" alignItems="center" gap={1} mb={2} onClick={() => setAddressOpen(true)} sx={{ cursor: 'pointer' }}>
                <Typography variant="body1">📍 {address}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">희망 기부 물품</Typography>
                <Button variant="outlined" size="small" onClick={loadDonations}>
                    새로고침
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={1} mb={4}>
                {donations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        등록된 희망 기부 물품이 없습니다.
                    </Typography>
                ) : (
                    donations.map((donation) => (
                        <Box key={donation.id} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 1,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1
                        }}>
                            <Typography variant="body1">
                                {donation.item_name}
                            </Typography>
                            <IconButton 
                                size="small" 
                                onClick={() => handleDelete(donation.id)}
                                sx={{ color: 'error.main' }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))
                )}
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" position="relative">
                <ControlPointRoundedIcon 
                    sx={{
                        width: 48,
                        height: 48,
                        cursor: 'pointer',
                    }}
                    onClick={() => setOpen(true)}
                />
            </Box>

            <Form2Dialog
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleSubmit}
                label1="물품명"
                commnet="기부하고 싶은 물품을 입력해주세요"
                loading={submitting}
                itemOnly={true}
            />

            <AddressDialog
                open={addressOpen}
                onClose={() => setAddressOpen(false)}
                onSubmit={handleAddressSubmit}
            />
        </Box>
    );
}
