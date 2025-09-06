// components/supply/SupplyList.jsx
import { Box } from '@mui/material';
import { SupplyItem } from './SupplyItem';

export const SupplyList = ({ supplies, onTrackingClick }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {supplies.map((supply, index) => (
                <SupplyItem
                    key={supply.id}
                    supply={supply}
                    onTrackingClick={onTrackingClick}
                    isLast={index === supplies.length - 1}
                />
            ))}
        </Box>
    );
};