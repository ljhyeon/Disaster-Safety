// hooks/useUserDonations.js
import { useState, useEffect } from 'react';
import { addUserDonationItem, getUserDonationItems, deleteUserDonationItem } from '../services/reliefService';
import { useAuthStore } from '../store/authStore';

export const useUserDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuthStore();

    // 희망 기부 물품 목록 로드
    useEffect(() => { if (user) loadDonations(); }, [user]);

    const loadDonations = async () => {
        setLoading(true); setError(null);
        try {
            const result = await getUserDonationItems(user.uid);
            if (result.success) setDonations(result.donations);
            else setError(result.error.message);
        } catch {
            setError('희망 기부 물품을 불러오는 중 오류가 발생했습니다.');
        } finally { setLoading(false); }
    };

    // 기부 물품 등록
    const handleSubmit = async (item) => {
        if (!user) return;
        setSubmitting(true);
        try {
            const result = await addUserDonationItem(user.uid, { item });
            if (result.success) { loadDonations(); return { success: true }; }
            else alert(`기부 물품 등록 실패: ${result.error.message}`);
        } catch {
            alert('기부 물품 등록 중 오류가 발생했습니다.');
        } finally { setSubmitting(false); }
    };

    // 기부 물품 삭제
    const handleDelete = async (donationId) => {
        if (!confirm('이 기부 물품을 삭제하시겠습니까?')) return;
        try {
            const result = await deleteUserDonationItem(donationId);
            if (result.success) loadDonations();
            else alert(`기부 물품 삭제 실패: ${result.error.message}`);
        } catch {
            alert('기부 물품 삭제 중 오류가 발생했습니다.');
        }
    };

    return { donations, loading, error, submitting, loadDonations, handleSubmit, handleDelete };
};
