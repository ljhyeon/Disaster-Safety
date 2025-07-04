import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

export function Form2Dialog({ open, onClose, onSubmit, label1 = '', label2 = '', commnet }) {
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState({ item: false, quantity: false });

    const handleSubmit = () => {
        const newError = {
            item: !item,
            quantity: !quantity,
        };
        setError(newError);

        // 둘 다 값이 있으면 제출
        if (!newError.item && !newError.quantity) {
            onSubmit({ item, quantity });
            setItem('');
            setQuantity('');
            setError({ item: false, quantity: false });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{commnet}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField
                        label={label1}
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                        fullWidth
                        error={error.item}
                        helperText={error.item ? '값을 입력해주세요.' : ''}
                    />
                    <TextField
                        label={label2}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        fullWidth
                        error={error.quantity}
                        helperText={error.quantity ? '값을 입력해주세요.' : ''}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ margin: '0 auto', width: 120 }}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
}
