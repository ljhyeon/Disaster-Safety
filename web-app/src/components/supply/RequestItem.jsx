// components/supply/RequestItem.jsx
import { Box, Typography } from '@mui/material';
import { getMatchingLevel } from '../../utils/requestUtils';

const RequestItem = ({ request, onRequestClick, isLast = false }) => {
    const getMatchingDescription = (request) => {
        const matchLevel = getMatchingLevel(request);
        switch (matchLevel) {
            case 'exact':
                return "내가 현재 가지고 있는 물품이에요";
            case 'similar':
                return "유사한 품목입니다";
            default:
                return "인근 대피소에서 필요로 하고 있어요";
        }
    };

    return (
        <Box key={request.id}>
            <Box 
                sx={{ 
                    cursor: 'pointer',
                    pl: 2,
                    pr: 2,
                    pt: 1,
                    pb: 1,
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    },
                    transition: 'background-color 0.2s ease-in-out'
                }}
                onClick={() => onRequestClick(request)}
            >
                <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {request.item_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1}}>
                    {getMatchingDescription(request)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {request.shelter?.shelter_name || '대피소 정보 없음'}
                </Typography>
                
                {request.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {request.description}
                    </Typography>
                )}
            </Box>
            
            {/* 마지막 아이템이 아닌 경우에만 구분선 표시 */}
            {!isLast && (
                <Box sx={{ 
                    height: '1px', 
                    backgroundColor: 'divider'
                }} />
            )}
        </Box>
    );
};

export default RequestItem;