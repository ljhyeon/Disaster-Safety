import { useState } from 'react';
import { Box, Typography, IconButton, Avatar } from '@mui/material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import { Form2Dialog } from '../components/Form2Dialog';

export function Setting() {
    const [open, setOpen] = useState(false);
    const [donations, setDonations] = useState([
        { item: '생수', quantity: '100개' },
        { item: '담요', quantity: '10개' },
    ]);

    const handleSubmit = ({ item, quantity }) => {
        setDonations((prev) => [...prev, { item, quantity: quantity + '개' }]);
    };

    return (
        <Box p={2}>
            <Typography variant="h6" fontWeight="bold">내 정보</Typography>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                {/* 사용자  */}
                <Typography variant="body1">내 주소</Typography>
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
        </Box>
    );
}
