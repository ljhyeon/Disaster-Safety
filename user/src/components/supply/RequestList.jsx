// components/supply/RequestList.jsx
import { Box } from '@mui/material';
import RequestItem from './RequestItem';

const RequestList = ({ requests, onRequestClick }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', }}>
            {requests.map((request) => (
                <RequestItem
                    key={request.id}
                    request={request}
                    onRequestClick={onRequestClick}
                />
            ))}
        </Box>
    );
};

export default RequestList;