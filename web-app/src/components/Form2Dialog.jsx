import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, CircularProgress } from '@mui/material';

export function Form2Dialog({ open, onClose, onSubmit, label1 = '', label2 = '', label3 = '', commnet, loading = false }) {
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [error, setError] = useState({ item: false, quantity: false, unit: false });

    const handleSubmit = () => {
        const newError = {
            item: !item,
            quantity: !quantity,
            unit: !unit,
        };
        setError(newError);

        // 모든 값이 있으면 제출
        if (!newError.item && !newError.quantity && !newError.unit) {
            onSubmit({ item, quantity, unit });
            setItem('');
            setQuantity('');
            setUnit('');
            setError({ item: false, quantity: false, unit: false });
            // loading 상태일 때는 onClose를 호출하지 않음 (부모 컴포넌트에서 처리)
            if (!loading) {
                onClose();
            }
        }
    };

    const handleClose = () => {
        if (!loading) {
            setItem('');
            setQuantity('');
            setUnit('');
            setError({ item: false, quantity: false, unit: false });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
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
                        disabled={loading}
                    />
                    <TextField
                        label={label2}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        fullWidth
                        error={error.quantity}
                        helperText={error.quantity ? '값을 입력해주세요.' : ''}
                        disabled={loading}
                    />
                    <TextField
                        label={label3}
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        fullWidth
                        error={error.unit}
                        helperText={error.unit ? '값을 입력해주세요.' : ''}
                        disabled={loading}
                        placeholder="예: 개, 박스, kg 등"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ margin: '0 auto', width: 120 }}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            등록 중...
                        </>
                    ) : (
                        '확인'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
