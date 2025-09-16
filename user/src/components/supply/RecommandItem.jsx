// components/supply/RecommandItem.jsx
import { Box, Typography, Chip, LinearProgress } from '@mui/material';

const RecommandItem = ({ request, onRequestClick, priority }) => {

    return (
        <Box key={request.id} sx={{ borderRadius: '12px', border: '1px solid #F3F4F6', mx: 2, my: 1, }}>
            <Box sx={{ cursor: 'pointer', p: '19px', '&:hover': { backgroundColor: 'action.hover' }, transition: 'background-color 0.2s ease-in-out' }} onClick={() => onRequestClick(request)}>
                <Box display='flex' justifyContent='space-between'>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>{request.item_name}</Typography>
                    <Chip
                        label={`우선순위 ${priority}`}
                        sx={{backgroundColor: '#E6F0FF', color: '#1428A0'}}
                    />
                </Box>

                {/* 매칭률 */}
                {/* 매칭률 */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: '#1428A0', mb: 0.5 }}
                    >
                        {/* 값 변경 필요 */}
                        매칭률 {85}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={85}  // 값 변경 필요
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#E5E7EB',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#1428A0',
                                borderRadius: 5,
                            },
                        }}
                    />
                </Box>

                <Typography variant='body1'>필요: {request.quantity}{request.unit}</Typography>
                <Typography variant='body2' sx={{ color: '#9CA3AF' }}>{request.shelter.shelter_name}</Typography>
            </Box>
        </Box>
    );
};

export default RecommandItem;
