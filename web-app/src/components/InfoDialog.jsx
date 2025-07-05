import { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Box, 
    Stack, 
    Typography, 
    TextField,
    Chip,
    Divider,
    CircularProgress
} from '@mui/material';
import { 
    Home as HomeIcon,
    LocationOn as LocationOnIcon,
    Inventory2 as Inventory2Icon,
    Numbers as NumbersIcon,
    Flag as PriorityIcon,
    Category as CategoryIcon,
    Phone as PhoneIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Message as MessageIcon
} from '@mui/icons-material';

export function InfoDialog({ 
    open, 
    onClose, 
    onSubmit, 
    title, 
    shelter, 
    address, 
    item, 
    quantity, 
    unit, 
    priority, 
    category, 
    subcategory, 
    description,
    loading = false
}) {
    const [formData, setFormData] = useState({
        supplierName: '',
        supplierPhone: '',
        supplierEmail: '',
        quantity: '',
        message: ''
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
        
        if (!formData.supplierName.trim()) {
            newErrors.supplierName = '공급자명을 입력해주세요';
        }
        
        if (!formData.supplierPhone.trim()) {
            newErrors.supplierPhone = '연락처를 입력해주세요';
        } else if (!/^010-\d{4}-\d{4}$/.test(formData.supplierPhone)) {
            newErrors.supplierPhone = '010-0000-0000 형식으로 입력해주세요';
        }
        
        if (!formData.quantity.trim()) {
            newErrors.quantity = '공급 수량을 입력해주세요';
        } else if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = '올바른 수량을 입력해주세요';
        }
        
        if (formData.supplierEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supplierEmail)) {
            newErrors.supplierEmail = '올바른 이메일 형식을 입력해주세요';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        
        onSubmit(formData);
    };

    const handleClose = () => {
        setFormData({
            supplierName: '',
            supplierPhone: '',
            supplierEmail: '',
            quantity: '',
            message: ''
        });
        setErrors({});
        onClose();
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case '긴급': return 'error';
            case '높음': return 'warning';
            case '보통': return 'info';
            case '낮음': return 'success';
            default: return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6">{title}</Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ p: 1 }}>
                    {/* 구호품 요청 정보 */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            요청 정보
                        </Typography>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <HomeIcon fontSize="small" color="action" />
                                <Typography variant="body2">{shelter}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LocationOnIcon fontSize="small" color="action" />
                                <Typography variant="body2">{address}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Inventory2Icon fontSize="small" color="action" />
                                <Typography variant="body2">{item}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <NumbersIcon fontSize="small" color="action" />
                                <Typography variant="body2">{quantity} {unit}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PriorityIcon fontSize="small" color="action" />
                                <Chip 
                                    label={priority}
                                    color={getPriorityColor(priority)}
                                    size="small"
                                />
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CategoryIcon fontSize="small" color="action" />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip label={category} variant="outlined" size="small" />
                                    <Chip label={subcategory} variant="outlined" size="small" />
                                </Box>
                            </Stack>
                            {description && (
                                <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {description}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* 공급자 정보 입력 */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            공급자 정보
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label="공급자명"
                                value={formData.supplierName}
                                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                                error={!!errors.supplierName}
                                helperText={errors.supplierName}
                                fullWidth
                                required
                                InputProps={{
                                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                            <TextField
                                label="연락처"
                                value={formData.supplierPhone}
                                onChange={(e) => handleInputChange('supplierPhone', e.target.value)}
                                error={!!errors.supplierPhone}
                                helperText={errors.supplierPhone}
                                fullWidth
                                required
                                placeholder="010-0000-0000"
                                InputProps={{
                                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                            <TextField
                                label="이메일 (선택)"
                                value={formData.supplierEmail}
                                onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                                error={!!errors.supplierEmail}
                                helperText={errors.supplierEmail}
                                fullWidth
                                InputProps={{
                                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                            <TextField
                                label="공급 수량"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange('quantity', e.target.value)}
                                error={!!errors.quantity}
                                helperText={errors.quantity}
                                fullWidth
                                required
                                type="number"
                                inputProps={{ min: 1 }}
                                InputProps={{
                                    startAdornment: <NumbersIcon sx={{ mr: 1, color: 'action.active' }} />,
                                    endAdornment: <Typography variant="body2" color="text.secondary">{unit}</Typography>
                                }}
                            />
                            <TextField
                                label="메시지 (선택)"
                                value={formData.message}
                                onChange={(e) => handleInputChange('message', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="추가 메시지나 특이사항을 입력해주세요"
                                InputProps={{
                                    startAdornment: <MessageIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                                }}
                            />
                        </Stack>
                    </Box>
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
                            '공급 등록'
                        )}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
