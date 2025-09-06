// components/supply/TrackingInfo.jsx
import { Box, Typography } from '@mui/material';

export const TrackingInfo = ({ supply }) => {
    if (!supply.courier_company || !supply.tracking_number) {
        return null;
    }

    return (
        <Box sx={{ mt: 2, p: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" color="primary">
                배송 정보
            </Typography>
            <Typography variant="body2">
                택배사: {supply.courier_company} | 송장번호: {supply.tracking_number}
            </Typography>
        </Box>
    );
};
