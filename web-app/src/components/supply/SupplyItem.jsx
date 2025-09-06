// components/supply/SupplyItem.jsx
import { Box, Typography, Chip } from '@mui/material';
import { getStatusInfo } from '../../utils/mapping';
import { TrackingInfo } from './TrackingInfo';

export const SupplyItem = ({ supply, onTrackingClick, isLast = false }) => {
    const statusInfo = getStatusInfo(supply.status);

    return (
        <Box key={supply.id}>
            <Box sx={{ cursor: 'pointer', pl: 2, pr: 2, pt: 1, pb: 1, '&:hover': { backgroundColor: 'action.hover' }, transition: 'background-color 0.2s ease-in-out' }} onClick={() => onTrackingClick(supply)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {supply.item_name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" icon={statusInfo.icon} />
                        <Typography variant="body2" color="text.secondary">
                            배송 수량: {supply.supplied_quantity} {supply.unit}
                        </Typography>
                    </Box>
                </Box>

                <TrackingInfo supply={supply} />
            </Box>
            
            {!isLast && (
                <Box sx={{ height: '1px', backgroundColor: 'divider' }} />
            )}
        </Box>
    );
};
