import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Stack, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { COURIER_COMPANIES } from '../../constants/courierCompanies';

export function TrackingDialog({ open, onClose, onSubmit, item, quantity, unit, loading = false }) {
    const [formData, setFormData] = useState({ courierCompany: '', trackingNumber: '' });
    const [errors, setErrors] = useState({});

    // 입력값 변경 핸들러
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // 폼 유효성 검사
    const validateForm = () => {
        const newErrors = {};
        if (!formData.courierCompany) newErrors.courierCompany = '택배사를 선택해주세요.';
        if (!formData.trackingNumber.trim()) newErrors.trackingNumber = '송장번호를 입력해주세요.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 등록 버튼 클릭
    const handleSubmit = () => { if (validateForm()) onSubmit(formData); };

    // 닫기 버튼 클릭
    const handleClose = () => {
        if (!loading) {
            setFormData({ courierCompany: '', trackingNumber: '' });
            setErrors({});
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" component="h2">
                    송장번호를 등록해주세요
                </Typography>
                <Typography variant="body2" color="#6B7280" sx={{ mt: 1 }}>
                    기부하신 구호품의 배송 현황을 추적할 수 있습니다
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    {/* 배송 정보 */}
                    {/* <Stack spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">배송 정보</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">물품:</Typography>
                            <Typography variant="body2">{item || '구호품'} {quantity || 0}{unit || '개'}</Typography>
                        </Box>
                    </Stack> */}
                    {/* 송장 정보 입력 */}
                    <Stack spacing={3}>
                        <FormControl fullWidth error={!!errors.courierCompany}>
                            <InputLabel>택배사</InputLabel>
                            <Select value={formData.courierCompany} label="택배사" onChange={e => handleInputChange('courierCompany', e.target.value)} disabled={loading}>
                                {COURIER_COMPANIES.map(company => (
                                    <MenuItem key={company.value} value={company.value}>{company.label}</MenuItem>
                                ))}
                            </Select>
                            {errors.courierCompany && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.courierCompany}</Typography>
                            )}
                        </FormControl>
                        <TextField
                            label="송장번호"
                            value={formData.trackingNumber}
                            onChange={e => handleInputChange('trackingNumber', e.target.value)}
                            fullWidth
                            error={!!errors.trackingNumber}
                            helperText={errors.trackingNumber}
                            placeholder="송장번호를 입력해주세요"
                            disabled={loading}
                        />
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" sx={{ width: "100%", gap: 1 }}>
                    <Button onClick={handleClose} variant="outlined" disabled={loading} sx={{ flex: 1 }}>닫기</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ flex: 1 }}>
                        {loading ? (<><CircularProgress size={20} sx={{ mr: 1 }} />접수 중...</>) : '접수하기'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
