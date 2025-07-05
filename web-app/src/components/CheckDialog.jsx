import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography } from '@mui/material';

export function CheckDialog({ open, onClose, }) {

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent>
                <Typography variant="body1" mt={4} whiteSpace="pre-line">
                    접수되었습니다.{'\n'}[기부 배송]에서 송장번호를 입력해주세요.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button
                        fullWidth
                        onClick={onClose}
                        variant="contained"
                        sx={{ mr: 1 }}
                    >
                        확인
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
