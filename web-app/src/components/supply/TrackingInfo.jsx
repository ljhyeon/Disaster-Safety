// components/supply/TrackingInfo.jsx
import { Box, Typography } from '@mui/material';

export const TrackingInfo = ({ supply, step }) => {
    console.log(step)
    if (step==='대기중') {
        return (
            <Box sx={{ mt: 2, p: 1, backgroundColor: '#FFFCEF', borderRadius: 1 }}>
                <Typography variant="body2">접수 필요</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ mt: 2, p: 1, backgroundColor: step==='배송중' ? '#F3F8FF' : '#FFE6E6', borderRadius: 1 }}>
            <Typography variant="body2">
                배송 정보: {supply.courier_company} | 송장번호: {supply.tracking_number}
            </Typography>
        </Box>
    );
};
