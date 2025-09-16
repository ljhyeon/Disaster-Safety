import { Box } from '@mui/material';
import WishItem from './WishItem';

const WishList = ({ donations, handleDelete }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', }}>
            {donations.map((donation) => (
                <WishItem
                    key={donation.id}
                    donation={donation}
                    handleDelete={handleDelete}
                />
            ))}
        </Box>
    );
};

export default WishList;