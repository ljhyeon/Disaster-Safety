// components/common/LoadingState.jsx
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingState = ({ message = "로딩 중..." }) => (
    <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        width: '100vw',
        flexDirection: 'column',
        gap: 2
    }}>
        <CircularProgress />
        <Typography>{message}</Typography>
    </Box>
);