// components/common/EmptyState.jsx
import { Box, Typography, Button } from '@mui/material';

export const EmptyState = ({ title, description, }) => (
    <Box sx={{ 
        flex: 1, // 부모 flex 남은 공간 차지
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
        minHeight: 200, // 최소 높이 보장
        py: 4, // 상하 패딩 추가
    }}>
        <img src='box.svg' alt='empty' style={{ maxWidth: '120px' }} />
        <Typography variant="h6" color="text.secondary">
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ whiteSpace: 'pre-line' }}>
            {description}
        </Typography>
    </Box>
);