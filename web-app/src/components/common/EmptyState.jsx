// components/common/EmptyState.jsx
import { Box, Typography, Button } from '@mui/material';

export const EmptyState = ({ title, description, actionLabel, onAction }) => (
    <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px',
        flexDirection: 'column',
        gap: 2
    }}>
        <Typography variant="h6" color="text.secondary">
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {description}
        </Typography>
        {onAction && (
            <Button variant="outlined" onClick={onAction}>
                {actionLabel}
            </Button>
        )}
    </Box>
);