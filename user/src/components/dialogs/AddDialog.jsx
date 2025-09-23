import { useState, useEffect } from 'react';
import {
  Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Chip, CircularProgress, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { matchCategory } from '../../services/itemCategoryMatcher';
import { searchItems, getPopularItems, updateItemPopularity, addReliefItem } from '../../services/reliefItemsService';

export function AddDialog({ open, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        item: '',
        quantity: ''
    });

    const [errors, setErrors] = useState({
        item: '',
        quantity: ''
    });

    const [matchedCategory, setMatchedCategory] = useState(null);
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 인기 아이템 로드
    useEffect(() => {
        if (open) {
            loadPopularItems();
        }
    }, [open]);

    const loadPopularItems = async () => {
        const result = await getPopularItems(8);
        if (result.success) {
            setPopularItems(result.items);
        }
    };

    // 물품명 입력시 자동 카테고리 매칭
    const handleItemChange = (value) => {
        setFormData(prev => ({ ...prev, item: value }));

        if (value.length > 0) {
            // 자동 카테고리 매칭
            const matched = matchCategory(value);
            setMatchedCategory(matched);
        } else {
            setMatchedCategory(null);
        }

        // 에러 초기화
        if (errors.item) {
            setErrors(prev => ({ ...prev, item: '' }));
        }
    };

    // 인기 아이템 빠른 선택
    const handlePopularItemClick = async (item) => {
        setFormData({
            item: item.name,
            quantity: ''
        });

        // 카테고리 자동 매칭
        const matched = matchCategory(item.name);
        setMatchedCategory({
            ...matched,
            category: item.category || matched.category,
            subcategory: item.subcategory || matched.subcategory,
            unit: item.unit || matched.unit
        });

        // 인기도 업데이트
        if (item.category && item.subcategory) {
            updateItemPopularity(item.category, item.subcategory, item.name);
        }
    };

    // 수량 변경 처리
    const handleQuantityChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, quantity: value }));
        if (errors.quantity) {
            setErrors(prev => ({ ...prev, quantity: '' }));
        }
    };

    // 제출 처리
    const handleSubmit = async () => {
        // 검증
        const newErrors = {
            item: !formData.item.trim() ? '물품명을 입력해주세요' : '',
            quantity: !formData.quantity.trim() ? '수량을 입력해주세요' : ''
        };

        setErrors(newErrors);

        if (!newErrors.item && !newErrors.quantity) {
            // 카테고리 자동 매칭 확인
            const finalMatch = matchedCategory || matchCategory(formData.item);

            // Realtime DB에 새 아이템 추가 (필요시)
            if (finalMatch.category !== '기타') {
                await addReliefItem(finalMatch.category, finalMatch.subcategory, {
                    name: formData.item.trim(),
                    unit: finalMatch.unit
                });
            }

            // 제출
            onSubmit({
                item: formData.item.trim(),
                quantity: parseInt(formData.quantity.trim()),
                category: finalMatch.category,
                subcategory: finalMatch.subcategory,
                unit: finalMatch.unit
            });

            handleClose();
        }
    };

    // 다이얼로그 닫기
    const handleClose = () => {
        setFormData({ item: '', quantity: '' });
        setErrors({ item: '', quantity: '' });
        setMatchedCategory(null);
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
                    보유 물품 등록
                </Typography>
                <Typography variant="body2" color="#6B7280" sx={{ mt: 0.5 }}>
                    물품명과 수량만 입력하세요
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={2.5}>

                    {/* 물품명 입력 */}
                    <Box>
                        <TextField
                            fullWidth
                            label="물품명"
                            placeholder="예: 컵라면, 마스크, 담요"
                            value={formData.item}
                            onChange={(e) => handleItemChange(e.target.value)}
                            error={!!errors.item}
                            helperText={errors.item}
                            variant="outlined"
                            autoFocus
                        />
                    </Box>

                    {/* 수량 입력 */}
                    <Box>
                        <TextField
                            fullWidth
                            label="수량"
                            placeholder="예: 20"
                            type="number"
                            value={formData.quantity}
                            onChange={handleQuantityChange}
                            error={!!errors.quantity}
                            helperText={errors.quantity || (matchedCategory ? `단위: ${matchedCategory.unit}` : '')}
                            variant="outlined"
                            InputProps={{
                                endAdornment: matchedCategory && (
                                    <Typography variant="body2" color="text.secondary">
                                        {matchedCategory.unit}
                                    </Typography>
                                )
                            }}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" sx={{ width: "100%", gap: 1 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ flex: 1 }}>
                        취소
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ flex: 1 }}
                        disabled={!formData.item || !formData.quantity}
                    >
                        등록하기
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}