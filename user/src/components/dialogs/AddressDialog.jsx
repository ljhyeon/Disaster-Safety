import { useState } from 'react';
import { Box, Typography, Stack, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox } from '@mui/material';
import { updateUser as updateUserInFirestore } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { FIREBASE_USER_FIELDS } from '../../constants/firebaseFields';

export function AddressDialog({ open, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        userName: '',
        contact: '',
        postalCode: '',
        roadAddress: '',
        detailAddress: '',
        isDefault: false
    });

    const [errors, setErrors] = useState({}); // 유효성 에러 상태

    const { user, updateUser } = useAuthStore();

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        setErrors(prev => ({ ...prev, [field]: '' })); // 입력 시 에러 초기화
    };

    const handleCheckboxChange = (e) => {
        setFormData(prev => ({
            ...prev,
            isDefault: e.target.checked
        }));
    };

    const handlePostalCodeSearch = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert('주소 검색 API 로드 실패');
            return;
        }

        new window.daum.Postcode({
            oncomplete: (data) => {
                // 선택한 주소 정보를 state에 반영
                setFormData(prev => ({
                    ...prev,
                    postalCode: data.zonecode,
                    roadAddress: data.roadAddress,
                    detailAddress: '' // 상세 주소는 사용자가 입력
                }));
            },
            width: '100%',
            height: '100%'
        }).open();
    };

    const handleSubmit = async () => {
        const newErrors = {};

        if (!formData.userName.trim()) newErrors.userName = '사용자명을 입력해주세요.';
        if (!formData.contact.trim()) newErrors.contact = '연락처를 입력해주세요.';
        if (formData.contact && !/^\d+$/.test(formData.contact)) newErrors.contact = '연락처는 숫자만 입력해주세요.';
        if (!formData.postalCode.trim()) newErrors.postalCode = '우편번호를 입력해주세요.';
        if (!formData.roadAddress.trim()) newErrors.roadAddress = '도로명 주소를 입력해주세요.';
        if (!formData.detailAddress.trim()) newErrors.detailAddress = '상세 주소를 입력해주세요.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Firestore에 저장
        if (!user || !user.email) {
            alert('로그인이 필요합니다.');
            return;
        }

        const updateData = {
            [FIREBASE_USER_FIELDS.NAME]: formData.userName,
            [FIREBASE_USER_FIELDS.PHONE_NUMBER]: formData.contact,
            [FIREBASE_USER_FIELDS.ZIPCODE]: formData.postalCode,
            [FIREBASE_USER_FIELDS.ROAD_ADDRESS]: formData.roadAddress,
            [FIREBASE_USER_FIELDS.ADDRESS_DETAIL]: formData.detailAddress,
        };

        // console.log('Saving user data:', updateData);
        const result = await updateUserInFirestore(user.email, updateData);
        // console.log('Firestore update result:', result);
        
        if (result.success) {
            // Zustand에 업데이트 (Firestore 필드명 사용)
            // console.log('Updating Zustand with:', updateData);
            updateUser(updateData);
            onSubmit(formData);
            handleClose();
        } else {
            alert('정보 저장에 실패했습니다.');
        }
    };

    const handleClose = () => {
        setFormData({
            userName: '',
            contact: '',
            postalCode: '',
            roadAddress: '',
            detailAddress: '',
            isDefault: false
        });
        setErrors({});
        onClose();
    };

    if (!open) return null;


    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" component="h2">
                    주소 입력
                </Typography>
                <Typography variant="body2" color="#6B7280" sx={{ mt: 1 }}>
                    사용자의 주소와 연락처를 입력해주세요.
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        fullWidth
                        placeholder="사용자명"
                        value={formData.userName}
                        onChange={handleInputChange('userName')}
                        error={!!errors.userName}
                        helperText={errors.userName || ''}
                        variant="outlined"
                    />

                    <TextField
                        fullWidth
                        placeholder="연락처 (숫자만)"
                        value={formData.contact}
                        onChange={handleInputChange('contact')}
                        error={!!errors.contact}
                        helperText={errors.contact || ''}
                        variant="outlined"
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            placeholder="우편번호(5자리)"
                            value={formData.postalCode}
                            // 직접 입력 못하게 readOnly
                            InputProps={{ readOnly: true }}
                            error={!!errors.postalCode}
                            helperText={errors.postalCode || ''}
                            variant="outlined"
                            sx={{ flex: 1, m: 0 }}
                        />
                        <Button variant="contained" onClick={handlePostalCodeSearch} sx={{ height: '56px' }}>
                            주소검색
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        placeholder="도로명 주소"
                        value={formData.roadAddress}
                        InputProps={{ readOnly: true }} // 읽기 전용
                        error={!!errors.roadAddress}
                        helperText={errors.roadAddress || ''}
                        variant="outlined"
                    />

                    <TextField
                        fullWidth
                        placeholder="상세 주소 (동/호)"
                        value={formData.detailAddress}
                        onChange={handleInputChange('detailAddress')}
                        error={!!errors.detailAddress}
                        helperText={errors.detailAddress || ''}
                        variant="outlined"
                    />

                    <Box sx={{ pt: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox checked={formData.isDefault} onChange={handleCheckboxChange} />
                            }
                            label='기본 주소지로 설정'
                        />
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" sx={{ width: "100%", gap: 1 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ flex: 1, }}>닫기</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ flex: 1, }}>등록하기</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
