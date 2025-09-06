import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

export function AddressDialog({ open, onClose, onSubmit }) {
    const [address, setAddress] = useState('');

    const handleSubmit = () => {
        if (!address.trim()) return alert('주소를 입력해주세요');
        onSubmit(address);
        setAddress('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>주소 입력</DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    <TextField
                        label="주소"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSubmit} variant="contained" sx={{ margin: '0 auto', width: 120 }}>
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
}
