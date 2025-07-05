import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import { Form2Dialog } from '../components/Form2Dialog';
import { AddressDialog } from '../components/AddressDialog';

export function Setting() {
    const [open, setOpen] = useState(false);      // 기부 물품 Dialog
    const [addressOpen, setAddressOpen] = useState(false); // 주소 Dialog
    const [address, setAddress] = useState('내 주소');

    const [donations, setDonations] = useState([
        { item: '생수', quantity: '100개' },
        { item: '담요', quantity: '10개' },
    ]);

    const handleSubmit = ({ item, quantity }) => {
        setDonations((prev) => [...prev, { item, quantity: quantity + '개' }]);
    };

    const handleAddressSubmit = (newAddress) => {
        setAddress(newAddress);
    };

    return (
        <Box p={2}>
            <Typography variant="h6" fontWeight="bold">내 정보</Typography>

            <Box display="flex" alignItems="center" gap={1} mb={2} onClick={() => setAddressOpen(true)} sx={{ cursor: 'pointer' }}>
                <Typography variant="body1">📍 {address}</Typography>
            </Box>

            <Typography variant="h6" fontWeight="bold" mb={1}>희망 기부 물품</Typography>
            <Box display="flex" flexDirection="column" gap={1} mb={4}>
                {donations.map((donation, idx) => (
                    <Typography key={idx} variant="body1">
                        {donation.item} {donation.quantity}
                    </Typography>
                ))}
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
                label2="수량"
                commnet="기부하고 싶은 물품을 입력해주세요"
            />

            <AddressDialog
                open={addressOpen}
                onClose={() => setAddressOpen(false)}
                onSubmit={handleAddressSubmit}
            />
        </Box>
    );
}
