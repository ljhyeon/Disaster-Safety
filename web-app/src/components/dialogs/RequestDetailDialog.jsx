import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography, Chip, TextField, IconButton, InputAdornment } from '@mui/material';
import { Schedule, Flag, Category } from '@mui/icons-material';
import { formatDate } from '../../utils/formatDate';
import { getPriorityBgColor, getPriorityTxtColor } from '../../utils/mapping';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function RequestDetailDialog({ open, onClose, onAccept, request, loading = false }) {
    const [supplyQuantity, setSupplyQuantity] = useState('');
    const [error, setError] = useState('');
    if (!request) return null;

    // 수량 입력 핸들러
    const handleQuantityChange = (value) => {
        setSupplyQuantity(value);
        if (error) setError('');
    };

    // 접수 버튼 핸들러
    const handleAccept = () => {
        if (!supplyQuantity || parseInt(supplyQuantity) <= 0) {
            setError('공급할 수량을 입력해주세요.');
            return;
        }
        onAccept({ quantity: parseInt(supplyQuantity) });
    };

    // 닫기 핸들러
    const handleClose = () => {
        setSupplyQuantity('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ width: 30 }}>
                        <IconButton color="inherit" onClick={handleClose}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Box>

                    <Typography variant="h6" component="div">구호품 요청 상세정보</Typography>

                    <Box sx={{ width: 30, display: 'flex', justifyContent: 'flex-end' }} />
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    {/* 기본 정보 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6">{request.item_name}</Typography>
                        <Typography variant="h6" color="primary">{request.quantity} {request.unit}</Typography>
                    </Box>

                    {/* 대피소 정보 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>대피소 정보</Typography>
                        <Box sx={{backgroundColor: "#F9FAFB", borderRadius: '8px', p: '8px' }}>
                            <Box sx={{display: 'flex', alignItem: 'center', gap: 1, }}>
                                <img src='building.svg' />
                                <Typography variant='body1'>{request.shelter.shelter_name}</Typography>
                            </Box>
                            <Typography variant='body2' sx={{ ml: '19px', color: '#666666' }}>{request.shelter.location}</Typography>
                        </Box>
                    </Box>

                    {/* 요청 상세 */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>요청 상세</Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Category fontSize="small" color="action" />
                                <Typography variant="body2" color='#444444'>{request.category} &gt; {request.subcategory}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Flag fontSize="small" color="action" />
                                <Chip
                                    label={request.priority}
                                    size="small"
                                    sx={{
                                        backgroundColor: getPriorityBgColor(request.priority),
                                        color: getPriorityTxtColor(request.priority),
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule fontSize="small" color="action" />
                                <Typography variant="body2" color='#444444'>{formatDate(request.created_at)}</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* 추가 메모 */}
                    {request.notes && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>추가 메모</Typography>
                            <Box sx={{backgroundColor: "#F9FAFB", borderRadius: '8px', p: '8px' }}>
                                <Typography variant="body2" color="#666666">{request.notes}</Typography>
                            </Box>
                        </Box>
                    )}

                    {/* 배송 수량 입력 */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>배송할 수량 입력</Typography>
                        <TextField
                            value={supplyQuantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            fullWidth
                            type="number"
                            inputProps={{ min: 1 }}
                            error={!!error}
                            helperText={error || ""}
                            placeholder={`배송 수량 입력`}
                            InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {request.unit}
                                </InputAdornment>
                            ),
                            }}
                        />
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" sx={{ width: "100%", gap: 1 }}>
                    <Button onClick={handleClose} variant="outlined" disabled={loading} sx={{ flex: 1 }}>닫기</Button>
                    <Button onClick={handleAccept} variant="contained" disabled={loading} sx={{ flex: 1 }}>접수하기</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
