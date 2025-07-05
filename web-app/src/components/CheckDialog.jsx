import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography } from '@mui/material';

export function CheckDialog({ open, onClose, onConfirm, shelter, item, quantity, unit }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>배송 확인</DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        해당 대피소에서 필요로 하는 구호품을 배송하시겠습니까?
                    </Typography>
                    
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                                대피소:
                            </Typography>
                            <Typography variant="body1">
                                {shelter || '대피소 정보 없음'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                                물품:
                            </Typography>
                            <Typography variant="body1">
                                {item || '구호품'} {quantity || 0}{unit || '개'}
                            </Typography>
                        </Box>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        접수 후 [기부 배송] 페이지에서 송장번호를 입력해주세요.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Box display="flex" justifyContent="space-between" sx={{ width: "100%", gap: 1 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{ flex: 1 }}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="contained"
                        sx={{ flex: 1 }}
                    >
                        접수
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
