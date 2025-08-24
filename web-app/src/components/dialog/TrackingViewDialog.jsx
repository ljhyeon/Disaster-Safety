import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography, Divider } from '@mui/material';
import { LocalShipping, Info } from '@mui/icons-material';

export function TrackingViewDialog({ open, onClose, supply }) {
    if (!supply) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping color="primary" />
                    <Typography variant="h6">
                        배송 조회
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    {/* 배송 정보 */}
                    <Stack spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            배송 정보
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                                대피소:
                            </Typography>
                            <Typography variant="body2">
                                {supply.shelter?.shelter_name || '대피소 정보 없음'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                                물품:
                            </Typography>
                            <Typography variant="body2">
                                {supply.item_name} {supply.supplied_quantity} {supply.unit}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* 운송장 정보 */}
                    {supply.courier_company && supply.tracking_number ? (
                        <Stack spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary.contrastText">
                                운송장 정보
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold" color="primary.contrastText">
                                    택배사:
                                </Typography>
                                <Typography variant="body2" color="primary.contrastText">
                                    {supply.courier_company}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold" color="primary.contrastText">
                                    송장번호:
                                </Typography>
                                <Typography variant="body2" color="primary.contrastText">
                                    {supply.tracking_number}
                                </Typography>
                            </Box>
                        </Stack>
                    ) : (
                        <Stack spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="warning.contrastText">
                                운송장 정보 없음
                            </Typography>
                            <Typography variant="body2" color="warning.contrastText">
                                아직 운송장이 등록되지 않았습니다.
                            </Typography>
                        </Stack>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* 안내 메시지 */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        p: 2, 
                        bgcolor: 'info.light', 
                        borderRadius: 1 
                    }}>
                        <Info color="info" />
                        <Typography variant="body2" color="info.contrastText">
                            추후 운송장 조회 화면 연동
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    fullWidth
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
} 