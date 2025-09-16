import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, CircularProgress } from '@mui/material';

export function Form2Dialog({ open, onClose, onSubmit, label1 = '', label2 = '', label3 = '', commnet, loading = false, itemOnly = false }) {
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [error, setError] = useState({ item: false, quantity: false, unit: false });

    // 입력값 검증 및 제출 처리
    const handleSubmit = () => {
        const newError = {
            item: !item,
            quantity: itemOnly ? false : !quantity,
            unit: itemOnly ? false : !unit,
        };
        setError(newError);

        const isValid = itemOnly ? !newError.item : (!newError.item && !newError.quantity && !newError.unit);
        if (isValid) {
            const submitData = itemOnly ? { item } : { item, quantity, unit };
            onSubmit(submitData);
            setItem(''); setQuantity(''); setUnit('');
            setError({ item: false, quantity: false, unit: false });
            if (!loading) onClose();
        }
    };

    // 다이얼로그 닫기 처리
    const handleClose = () => {
        if (!loading) {
            setItem(''); setQuantity(''); setUnit('');
            setError({ item: false, quantity: false, unit: false });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{commnet}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField label={label1} value={item} onChange={e => setItem(e.target.value)} fullWidth error={error.item} helperText={error.item ? '값을 입력해주세요.' : ''} disabled={loading} />
                    {!itemOnly && (
                        <>
                            <TextField label={label2} value={quantity} onChange={e => setQuantity(e.target.value)} fullWidth error={error.quantity} helperText={error.quantity ? '값을 입력해주세요.' : ''} disabled={loading} />
                            <TextField label={label3} value={unit} onChange={e => setUnit(e.target.value)} fullWidth error={error.unit} helperText={error.unit ? '값을 입력해주세요.' : ''} disabled={loading} placeholder="예: 개, 박스, kg 등" />
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSubmit} variant="contained" sx={{ margin: '0 auto', width: 120 }} disabled={loading}>
                    {loading ? (<><CircularProgress size={20} sx={{ mr: 1 }} />등록 중...</>) : '확인'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
