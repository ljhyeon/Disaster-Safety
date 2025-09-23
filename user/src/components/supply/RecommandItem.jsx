// components/supply/RecommandItem.jsx
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { getMatchingLevel } from '../../utils/recommendationUtils';

const RecommandItem = ({ request, onRequestClick, priority }) => {
    // 매칭 점수 가져오기 (0~1 범위를 0~100으로 변환)
    const matchingScore = request.matchingScore ? Math.round(request.matchingScore * 100) : 0;
    const matchingLevel = getMatchingLevel(request.matchingScore || 0);

    // 거리 표시를 위한 포맷팅
    const formatDistance = (distance) => {
        if (!distance || distance === Infinity) return null;
        if (distance < 1) return `${Math.round(distance * 1000)}m`;
        return `${distance.toFixed(1)}km`;
    };

    const distance = request.scoreDetails?.distance;

    return (
        <Box key={request.id} sx={{ borderRadius: '12px', border: '1px solid #F3F4F6', mx: 2, my: 1, }}>
            <Box sx={{ cursor: 'pointer', p: '19px', '&:hover': { backgroundColor: 'action.hover' }, transition: 'background-color 0.2s ease-in-out' }} onClick={() => onRequestClick(request)}>
                <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>{request.item_name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip
                            label={`추천순위 ${priority}`}
                            sx={{ backgroundColor: '#E6F0FF', color: '#1428A0' }}
                        />
                    </Box>
                </Box>

                {/* 매칭률 */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: matchingLevel.color, fontWeight: 600 }}
                        >
                            매칭률 {matchingScore}%
                        </Typography>
                        {formatDistance(distance) && (
                            <Typography variant="caption" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 14 }} />
                                {formatDistance(distance)}
                            </Typography>
                        )}
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={matchingScore}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#E5E7EB',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: matchingLevel.color,
                                borderRadius: 5,
                            },
                        }}
                    />
                </Box>

                <Typography variant='body1'>필요: {request.quantity}{request.unit}</Typography>
                <Typography variant='body2' sx={{ color: '#9CA3AF' }}>{request.shelter?.shelter_name || '대피소 정보 없음'}</Typography>
            </Box>
        </Box>
    );
};

export default RecommandItem;
