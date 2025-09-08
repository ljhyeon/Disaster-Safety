import { Box, Typography, IconButton, } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const WishItem = ({ donation, handleDelete }) => {

    return (
        <Box key={donation.id} sx={{ borderRadius: '12px', border: '1px solid #F3F4F6', my: 1, }}>
            <Box sx={{ p: '19px', }}>
                <Typography variant='caption'>식량 &gt; 즉석식품</Typography> {/* 수정 필요 */}
                <Typography variant="body1" sx={{ mb: 0.5 }}>{donation.item_name}</Typography>
                <Typography variant='body2' color="#1428A0">수량: 20개</Typography> {/* 수정 필요 */}
            </Box>
        </Box>
    );
};

export default WishItem;