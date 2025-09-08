// components/supply/RecommandList.jsx
import { Box } from '@mui/material';
import RecommandItem from './RecommandItem';

const RecommandList = ({ requests, onRequestClick }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', }}>
            {requests.map((request, idx) => (
                <RecommandItem
                    key={request.id}
                    request={request}
                    onRequestClick={onRequestClick}
                    priority={idx+1}
                />
            ))}
        </Box>
    );
};

export default RecommandList;