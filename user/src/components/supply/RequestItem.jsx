// components/supply/RequestItem.jsx
import { Box, Typography } from '@mui/material';

const RequestItem = ({ request, onRequestClick }) => {

    return (
        <Box key={request.id} sx={{ borderRadius: '12px', border: '1px solid #F3F4F6', mx: 2, my: 1, }}>
            <Box sx={{ cursor: 'pointer', p: '19px', '&:hover': { backgroundColor: 'action.hover' }, transition: 'background-color 0.2s ease-in-out' }} onClick={() => onRequestClick(request)}>
                <Typography variant="h6" component="h2" sx={{ mb: 1 }}>{request.item_name}</Typography>
                <Typography variant='body1'>필요: {request.quantity}{request.unit}</Typography>
                <Typography variant='body2' sx={{ color: '#9CA3AF' }}>{request.shelter.shelter_name}</Typography>
            </Box>
        </Box>
    );
};

export default RequestItem;
