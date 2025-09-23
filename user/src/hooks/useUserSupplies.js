// hooks/useUserSupplies.js
import { useState, useEffect } from 'react';
import { getReliefSuppliesByUser, updateSupplyTracking } from '../services/reliefService';
import { useAuthStore } from '../store/authStore';

export const useUserSupplies = () => {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuthStore();

    // 사용자 공급 목록 불러오기
    const loadSupplies = async () => {
        setLoading(true); setError(null);
        try {
            const result = await getReliefSuppliesByUser(user.uid);
            if (result.success) setSupplies(result.supplies);
            else setError(result.error.message);
        } catch {
            setError('공급 이력을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 송장번호 등록 처리
    const handleTrackingSubmit = async (supplyId, trackingData) => {
        setSubmitting(true);
        try {
            const result = await updateSupplyTracking(supplyId, trackingData);
            if (result.success) {
                let message = '송장번호가 등록되었습니다.';

                alert(message);
                await loadSupplies(); // await 추가하여 데이터 로드 완료를 기다림
                return { success: true };
            } else {
                alert(`송장번호 등록 실패: ${result.error.message}`);
                return { success: false };
            }
        } catch (err) {
            alert('송장번호 등록 중 오류가 발생했습니다.');
            console.error('송장번호 등록 실패:', err);
            return { success: false };
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => { if (user) loadSupplies(); }, [user]);

    return { supplies, loading, error, submitting, loadSupplies, handleTrackingSubmit };
};
