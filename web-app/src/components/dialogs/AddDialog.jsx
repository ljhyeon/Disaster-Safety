import { useState } from 'react';
import { Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

export function AddDialog({ open, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        item: '',
        quantity: ''
    });
    
    const [errors, setErrors] = useState({
        item: '',
        quantity: ''
    });

    // 입력값 변경 처리
    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // 입력하면 에러 메시지 제거
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // 입력값 검증 및 제출 처리
    const handleSubmit = () => {
        const newErrors = {
            item: !formData.item.trim() ? '물품명을 입력해주세요' : '',
            quantity: !formData.quantity.trim() ? '수량을 입력해주세요' : ''
        };
        
        setErrors(newErrors);

        // 에러가 없는 경우에만 제출
        if (!newErrors.item && !newErrors.quantity) {
            onSubmit({
                item: formData.item.trim(),
                quantity: formData.quantity.trim()
            });
            handleClose();
        }
    };

    // 다이얼로그 닫기 처리
    const handleClose = () => {
        setFormData({ item: '', quantity: '' });
        setErrors({ item: '', quantity: '' });
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    기부 물품 등록
                </Typography>
                <Typography variant="body2" color="#6B7280" sx={{ mt: 0.5 }}>
                    보유 중인 구호품 정보를 입력해주세요
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        placeholder="예: 컵라면"
                        value={formData.item}
                        onChange={handleInputChange('item')}
                        error={!!errors.item}
                        helperText={errors.item}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        placeholder="예: 20"
                        value={formData.quantity}
                        onChange={handleInputChange('quantity')}
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                        variant="outlined"
                    />
                </Stack>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" sx={{ width: "100%", gap: 1 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ flex: 1, }}>닫기</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ flex: 1, }}>접수하기</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
