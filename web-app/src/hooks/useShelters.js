// hooks/useShelters.js
import { useState, useEffect } from 'react';
import { getAllShelters, } from '../services/shelterService';
import { testFirebaseConnection } from '../services/reliefService';

export const useShelters = () => {
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 대피소 데이터 로드
    useEffect(() => {
        // Firebase 연결 테스트 먼저 실행
        testFirebaseConnection().then(() => {
            loadShelters();
        });
    }, []);

    const loadShelters = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 타임아웃 설정 (10초)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('요청 시간 초과')), 10000)
            );
            
            const result = await Promise.race([
                getAllShelters(),
                timeoutPromise
            ]);
            
            if (result.success) {
                setShelters(result.shelters);
            } else {
                setError(result.error?.message || '대피소 데이터를 불러올 수 없습니다.');
            }
        } catch {
            setError('대피소 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return {
        shelters,
        loading,
        error,
        loadShelters
    };
};