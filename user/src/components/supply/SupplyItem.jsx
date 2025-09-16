// components/supply/SupplyItem.jsx
import { Box, Typography, Chip } from '@mui/material';
import { getStatusInfo } from '../../utils/mapping';
import { TrackingInfo } from './TrackingInfo';

export const SupplyItem = ({ supply, onTrackingClick, }) => {
    const statusInfo = getStatusInfo(supply.status);

    return (
        <Box key={supply.id}>
            <Box sx={{ borderRadius: '12px', border: '1px solid #F3F4F6', mx: 2, my: 1, cursor: 'pointer', pl: 2, pr: 2, pt: 1, pb: 1, '&:hover': { backgroundColor: 'action.hover' }, transition: 'background-color 0.2s ease-in-out' }} onClick={() => onTrackingClick(supply)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>{supply.item_name}</Typography>
                        <Typography variant='body2' color="#4B5563">{supply.shelter.shelter_name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip label={statusInfo.label} size="small" sx={{ backgroundColor: statusInfo.backgroundColor, color: statusInfo.color }} />
                    </Box>
                </Box>

                <TrackingInfo supply={supply} step={statusInfo.label} />
            </Box>
        </Box>
    );
};
