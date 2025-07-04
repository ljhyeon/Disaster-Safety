import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';

export function InfoDialog({ open, onClose, onSubmit, title, shelter, address, item, quantity }) {

    const handleSubmit = () => {
        onSubmit();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box p={2} textAlign="center">
                    <Stack spacing={1} alignItems="flex-start">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <HomeOutlinedIcon fontSize="small" />
                            <Typography variant="body1">{shelter}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnOutlinedIcon fontSize="small" />
                            <Typography variant="body1">{address}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Inventory2OutlinedIcon fontSize="small" />
                            <Typography variant="body1">{item}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <NumbersOutlinedIcon fontSize="small" />
                            <Typography variant="body1">{quantity}개</Typography>
                        </Stack>
                    </Stack>

                    <Typography variant="body1" mt={4} whiteSpace="pre-line">
                        해당 대피소에서{'\n'}필요로 하는 구호품을 배송하시겠습니까?
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Box display="flex" justifyContent="space-between" mt={2} sx={{width: "100%"}}>
                    <Button
                        fullWidth
                        onClick={onClose}
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        취소
                    </Button>
                    <Button
                        fullWidth
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ mr: 1 }}
                    >
                        접수
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
