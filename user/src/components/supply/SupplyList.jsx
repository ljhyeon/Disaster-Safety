// components/supply/SupplyList.jsx
import { Box } from '@mui/material';
import { SupplyItem } from './SupplyItem';

export const SupplyList = ({ supplies, onTrackingClick }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {supplies.map((supply) => (
                <SupplyItem
                    key={supply.id}
                    supply={supply}
                    onTrackingClick={onTrackingClick}
                />
            ))}
        </Box>
    );
};