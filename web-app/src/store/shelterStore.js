import { create } from 'zustand';

export const useShelterStore = create((set, get) => ({
    // 대피소 정보
    shelterId: null,
    shelterName: null,
    shelterAddress: null,
    
    // 기부 정보 목록
    donationList: [],
    
    // 대피소 정보 설정
    setShelterInfo: (id, name, address) => set({ 
        shelterId: id, 
        shelterName: name, 
        shelterAddress: address 
    }),
    
    // 기존 함수도 유지 (호환성을 위해)
    setShelterId: (id) => set({ shelterId: id }),
    
    // 기부 정보 추가
    addDonation: (donationInfo) => set((state) => ({
        donationList: [...state.donationList, {
            ...donationInfo,
            id: Date.now(), // 고유 ID 생성
            createdAt: new Date().toISOString(),
            status: 'pending' // 상태: pending, shipped, delivered
        }]
    })),
    
    // 기부 정보 업데이트 (송장 번호 등록 등)
    updateDonation: (donationId, updateInfo) => set((state) => ({
        donationList: state.donationList.map(donation =>
            donation.id === donationId 
                ? { ...donation, ...updateInfo }
                : donation
        )
    })),
    
    // 기부 정보 삭제
    removeDonation: (donationId) => set((state) => ({
        donationList: state.donationList.filter(donation => donation.id !== donationId)
    })),
    
    // 특정 대피소의 기부 목록 가져오기
    getDonationsByShelter: (shelterId) => {
        const state = get();
        return state.donationList.filter(donation => donation.shelterId === shelterId);
    },
    
    // 모든 정보 초기화
    clearShelterInfo: () => set({
        shelterId: null,
        shelterName: null,
        shelterAddress: null
    }),
    
    // 기부 목록 초기화
    clearDonationList: () => set({
        donationList: []
    }),
    
    // 전체 초기화
    clearAll: () => set({
        shelterId: null,
        shelterName: null,
        shelterAddress: null,
        donationList: []
    })
}));