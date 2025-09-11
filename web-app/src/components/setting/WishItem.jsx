import { Box, Typography, IconButton, } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const WishItem = ({ donation, handleDelete }) => {

    return (
        <Box key={donation.id} sx={{ borderRadius: '12px', border: '1px solid #F3F4F6', my: 1, }}>
            <Box sx={{ p: '19px', }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='caption'>식량 &gt; 즉석식품</Typography> {/* 수정 필요 */}
                    <IconButton onClick={() => handleDelete(donation.id)} sx={{ color: "#D8D8D8", width: '13px', height: '13px', p: 0 }}><CloseIcon /></IconButton>
                </Box>
                <Typography variant="body1" sx={{ mb: 0.5 }}>{donation.item_name}</Typography>
                <Typography variant='body2' color="#1428A0">수량: 20개</Typography> {/* 수정 필요 */}
            </Box>
        </Box>
    );
};

export default WishItem;