// components/common/ErrorState.jsx
import { Box, Alert, Button } from '@mui/material';

export const ErrorState = ({ error, onRetry }) => (
    <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
            {error}
        </Alert>
        {onRetry && (
            <Button variant="outlined" onClick={onRetry}>
                다시 시도
            </Button>
        )}
    </Box>
);