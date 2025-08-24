import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography, Chip, Divider, TextField } from '@mui/material';
import { LocationOn, Schedule, Flag, Category,} from '@mui/icons-material';
import { formatDate } from '../../utils/formatDate';
import { getPriorityColor } from '../../utils/mapping';

export function RequestDetailDialog({ open, onClose, onAccept, request, loading = false }) {
    const [supplyQuantity, setSupplyQuantity] = useState('');
    const [error, setError] = useState('');

    if (!request) return null;

    const handleQuantityChange = (value) => {
        setSupplyQuantity(value);
        if (error) setError('');
    };

    const handleAccept = () => {
        if (!supplyQuantity || parseInt(supplyQuantity) <= 0) {
            setError('공급할 수량을 입력해주세요.');
            return;
        }
        onAccept({ quantity: parseInt(supplyQuantity) });
    };

    const handleClose = () => {
        setSupplyQuantity('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" component="div">
                    구호품 요청 상세정보
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                <Stack spacing={3} sx={{ py: 1 }}>
                    {/* 기본 정보 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {request.item_name}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {request.quantity} {request.unit}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* 대피소 정보 */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                            대피소 정보
                        </Typography>
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn fontSize="small" color="action" />
                                <Typography variant="body2">
                                    {request.shelter?.shelter_name || '대피소 정보 없음'}
                                </Typography>
                            </Box>
                            {request.shelter?.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 20 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {request.shelter.location}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>

                    <Divider />

                    {/* 요청 상세 정보 */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            요청 상세
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Category fontSize="small" color="action" />
                                <Typography variant="body2">
                                    카테고리: {request.category} &gt; {request.subcategory}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Flag fontSize="small" color="action" />
                                <Typography variant="body2">우선순위:</Typography>
                                <Chip 
                                    label={request.priority}
                                    color={getPriorityColor(request.priority)}
                                    size="small"
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule fontSize="small" color="action" />
                                <Typography variant="body2">
                                    요청일: {formatDate(request.created_at)}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* 메모/설명 */}
                    {request.notes && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                    추가 메모
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {request.notes}
                                </Typography>
                            </Box>
                        </>
                    )}

                    {/* 다중 구호품 표시 */}
                    {request.relief_items && request.relief_items.length > 1 && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                    전체 요청 목록 ({request.total_items}개)
                                </Typography>
                                <Stack spacing={1}>
                                    {request.relief_items.map((item, index) => (
                                        <Box key={index} sx={{ 
                                            p: 1, 
                                            bgcolor: 'grey.50', 
                                            borderRadius: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Typography variant="body2">
                                                {item.item_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.quantity} {item.unit}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </>
                    )}

                    {/* 배송 수량 입력 */}
                    <Divider />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            배송할 수량
                        </Typography>
                        <TextField
                            label="배송 수량"
                            value={supplyQuantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            fullWidth
                            type="number"
                            inputProps={{ min: 1 }}
                            error={!!error}
                            helperText={error || `단위: ${request.unit}`}
                            placeholder={`최대 ${request.quantity} ${request.unit}`}
                        />
                    </Box>
                </Stack>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" sx={{ width: "100%", gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={loading}
                        sx={{ flex: 1 }}
                    >
                        닫기
                    </Button>
                    <Button
                        onClick={handleAccept}
                        variant="contained"
                        disabled={loading}
                        sx={{ flex: 1 }}
                    >
                        접수하기
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
} 