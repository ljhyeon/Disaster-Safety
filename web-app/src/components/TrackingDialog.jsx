import { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Button, 
    Box, 
    Stack, 
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';

const COURIER_COMPANIES = [
    { value: 'cj', label: 'CJ대한통운' },
    { value: 'hanjin', label: '한진택배' },
    { value: 'lotte', label: '롯데택배' },
    { value: 'logen', label: '로젠택배' },
    { value: 'post', label: '우체국택배' },
    { value: 'kdexp', label: '경동택배' },
    { value: 'daesin', label: '대신택배' },
    { value: 'epost', label: 'EMS' },
    { value: 'other', label: '기타' }
];

export function TrackingDialog({ 
    open, 
    onClose, 
    onSubmit, 
    shelter, 
    item, 
    quantity, 
    unit,
    loading = false 
}) {
    const [formData, setFormData] = useState({
        courierCompany: '',
        trackingNumber: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // 에러 클리어
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.courierCompany) {
            newErrors.courierCompany = '택배사를 선택해주세요.';
        }
        
        if (!formData.trackingNumber.trim()) {
            newErrors.trackingNumber = '송장번호를 입력해주세요.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                courierCompany: '',
                trackingNumber: ''
            });
            setErrors({});
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>송장번호 등록</DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    {/* 배송 정보 표시 */}
                    <Stack spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            배송 정보
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                                대피소:
                            </Typography>
                            <Typography variant="body2">
                                {shelter || '대피소 정보 없음'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                                물품:
                            </Typography>
                            <Typography variant="body2">
                                {item || '구호품'} {quantity || 0}{unit || '개'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* 송장 정보 입력 */}
                    <Stack spacing={3}>
                        <FormControl fullWidth error={!!errors.courierCompany}>
                            <InputLabel>택배사</InputLabel>
                            <Select
                                value={formData.courierCompany}
                                label="택배사"
                                onChange={(e) => handleInputChange('courierCompany', e.target.value)}
                                disabled={loading}
                            >
                                {COURIER_COMPANIES.map((company) => (
                                    <MenuItem key={company.value} value={company.value}>
                                        {company.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.courierCompany && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                    {errors.courierCompany}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            label="송장번호"
                            value={formData.trackingNumber}
                            onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
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
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={loading}
                        sx={{ flex: 1 }}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        sx={{ flex: 1 }}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                등록 중...
                            </>
                        ) : (
                            '등록'
                        )}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
} 