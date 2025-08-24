// components/supply/RequestList.jsx
import { Box } from '@mui/material';
import RequestItem from './RequestItem';

const RequestList = ({ requests, onRequestClick }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {requests.map((request, index) => (
                <RequestItem
                    key={request.id}
                    request={request}
                    onRequestClick={onRequestClick}
                    isLast={index === requests.length - 1}
                />
            ))}
        </Box>
    );
};

export default RequestList;