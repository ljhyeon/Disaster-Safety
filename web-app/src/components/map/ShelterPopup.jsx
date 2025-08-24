// components/map/ShelterPopup.jsx
import { Box, Typography, Button } from '@mui/material';

export const ShelterPopup = ({ shelter, onSelect }) => {
    const handleSelect = () => {
        onSelect(shelter.shelter_id, shelter.shelter_name, shelter.location);
    };

    return (
        <Box textAlign="center">
            <Typography fontWeight="bold" fontSize={14}>
                {shelter.shelter_name}
            </Typography>
            <Typography fontSize={12} sx={{ mb: 1 }}>
                {shelter.location}
            </Typography>
            <Typography fontSize={11} color="text.secondary" sx={{ mb: 1 }}>
                {shelter.disaster_type} • {shelter.status}
            </Typography>
            <Typography fontSize={11} color="text.secondary" sx={{ mb: 1 }}>
                수용: {shelter.current_occupancy}/{shelter.capacity}명 ({shelter.occupancy_rate}%)
            </Typography>
            <Button
                variant="contained"
                size="small"
                sx={{ mt: 1, fontSize: 12 }}
                onClick={handleSelect}
            >
                상세보기 →
            </Button>
        </Box>
    );
};