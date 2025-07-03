import { Box, Typography, IconButton } from '@mui/material';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';

export function Item({
    title,
    description,
    location,
    showButton = false,
    buttonLabel = '',
    onButtonClick,
    onClick,
}) {
    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={2}
            py={1}
            onClick={onClick}
        >
            <Box>
                <Typography variant="h6" fontWeight="bold">{title}</Typography>
                <Typography variant="body1" fontWeight="medium">{description}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>{location}</Typography>
            </Box>

            {showButton && (
                <Box display="grid" textAlign="center" width="90px">
                    <IconButton onClick={onButtonClick}>
                        <InventoryRoundedIcon />
                    </IconButton>
                    <Typography variant="caption">{buttonLabel}</Typography>
                </Box>
            )}
        </Box>
    );
}