// hooks/useReliefRequests.js
import { useState, useEffect } from 'react';
import { getAllReliefRequests, addReliefSupplySimple, getUserDonationItems } from '../services/reliefService';
import { useAuthStore } from '../store/authStore';

export const useReliefRequests = () => {
    const [allRequests, setAllRequests] = useState([]);
    const [userDonations, setUserDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [supplying, setSupplying] = useState(false);
    const { user } = useAuthStore();

    // 모든 구호품 요청 목록 로드
    useEffect(() => { if (user) loadAllRequests(); }, [user]);

    const loadAllRequests = async () => {
        if (!user) return;
        setLoading(true); setError(null);
        try {
            const [allRequestsResult, userDonationsResult] = await Promise.all([
                getAllReliefRequests(), getUserDonationItems(user.uid)
            ]);
            setAllRequests(allRequestsResult.success ? (allRequestsResult.requests || []) : []);
            setUserDonations(userDonationsResult.success ? (userDonationsResult.donations || []) : []);
            if (!allRequestsResult.success) setError('구호품 요청을 불러올 수 없습니다.');
        } catch {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (selectedRequest, acceptData) => {
        if (!selectedRequest || !user || !acceptData?.quantity) return;
        setSupplying(true);
        try {
            const result = await addReliefSupplySimple(selectedRequest.request_id, user.uid, {
                item_name: selectedRequest.item_name,
                quantity: acceptData.quantity,
                requested_quantity: selectedRequest.quantity,
                unit: selectedRequest.unit,
                category: selectedRequest.category,
                subcategory: selectedRequest.subcategory,
                priority: selectedRequest.priority,
                notes: selectedRequest.notes || ''
            });
            if (result.success) { loadAllRequests(); return { success: true }; }
            else throw new Error(result.error.message);
        } catch (error) {
            console.log(error); throw error;
        } finally {
            setSupplying(false);
        }
    };

    return { allRequests, userDonations, loading, error, supplying, loadAllRequests, handleAccept };
};
