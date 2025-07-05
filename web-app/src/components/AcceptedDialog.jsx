import { 
    Dialog, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export function AcceptedDialog({ 
    open, 
    onClose
}) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle 
                    sx={{ 
                        fontSize: 60, 
                        color: 'success.main', 
                        mb: 2 
                    }} 
                />
                <Typography variant="h6" sx={{ mb: 2 }}>
                    접수되었습니다
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    [기부배송]에서 송장번호를 입력해주세요.
                </Typography>
            </DialogContent>
            
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{ minWidth: 120 }}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
} 