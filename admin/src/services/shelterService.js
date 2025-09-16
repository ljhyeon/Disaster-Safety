// 대피소 정보 관리 서비스
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// 재난 유형 상수
export const DISASTER_TYPES = {
  EARTHQUAKE: '지진',
  FIRE: '화재',
  FLOOD: '홍수',
  TYPHOON: '태풍',
  LANDSLIDE: '산사태',
  OTHER: '기타'
};

// 대피소 운영 상태 상수
export const SHELTER_STATUS = {
  OPERATING: '운영중',
  FULL: '포화',
  CLOSED: '폐쇄'
};

// 대피소 정보 생성 (OFFC00)
export const createShelter = async (shelterData) => {
  try {
    const {
      shelterName,
      location,
      disasterType,
      capacity,
      currentOccupancy,
      hasDisabledFacility = false,
      hasPetZone = false,
      status,
      contactPerson,
      contactPhone,
      managerId, // 관리하는 공무원 ID
      latitude,
      longitude
    } = shelterData;

    // 필수 필드 검증
    if (!shelterName || !location || !disasterType || !capacity || 
        currentOccupancy === undefined || !status || !contactPerson || !contactPhone) {
      throw new Error('필수 항목을 모두 입력해주세요.');
    }

    // 고유 ID 생성 (타임스탬프 기반)
    const shelterId = `SH${Date.now()}`;

    const shelterDoc = {
      shelter_id: shelterId,
      shelter_name: shelterName,
      location: location,
      latitude: latitude || null,
      longitude: longitude || null,
      disaster_type: disasterType,
      capacity: parseInt(capacity),
      current_occupancy: parseInt(currentOccupancy),
      occupancy_rate: Math.round((parseInt(currentOccupancy) / parseInt(capacity)) * 100),
      has_disabled_facility: hasDisabledFacility,
      has_pet_zone: hasPetZone,
      status: status,
      contact_person: contactPerson,
      contact_phone: contactPhone,
      manager_id: managerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'shelters', shelterId), shelterDoc);

    return {
      success: true,
      shelter: shelterDoc,
      message: '대피소 정보가 등록되었습니다.',
      shelter_id: shelterId
    };
  } catch (error) {
    console.error('대피소 생성 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'shelter-creation-failed',
        message: error.message || '대피소 정보 저장 중 오류가 발생했습니다.'
      }
    };
  }
};

// 대피소 정보 조회
export const getShelter = async (shelterId) => {
  try {
    const shelterDoc = await getDoc(doc(db, 'shelters', shelterId));
    
    if (shelterDoc.exists()) {
      return {
        success: true,
        shelter: shelterDoc.data()
      };
    } else {
      return {
        success: false,
        error: {
          code: 'shelter-not-found',
          message: '해당 대피소 정보를 찾을 수 없습니다.'
        }
      };
    }
  } catch (error) {
    console.error('대피소 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'shelter-fetch-failed',
        message: error.message || '대피소 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 모든 대피소 조회 (지도용)
export const getAllShelters = async () => {
  try {
    const q = query(collection(db, 'shelters'), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const shelters = [];
    querySnapshot.forEach((doc) => {
      shelters.push(doc.data());
    });
    
    return {
      success: true,
      shelters: shelters
    };
  } catch (error) {
    console.error('전체 대피소 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'shelters-fetch-failed',
        message: error.message || '대피소 목록 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 관리자별 대피소 조회
export const getSheltersByManager = async (managerId) => {
  try {
    const q = query(
      collection(db, 'shelters'), 
      where('manager_id', '==', managerId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const shelters = [];
    querySnapshot.forEach((doc) => {
      shelters.push(doc.data());
    });
    
    return {
      success: true,
      shelters: shelters
    };
  } catch (error) {
    console.error('관리자별 대피소 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'manager-shelters-fetch-failed',
        message: error.message || '관리 대피소 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 대피소 정보 업데이트
export const updateShelter = async (shelterId, updateData) => {
  try {
    const updatedData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    // 수용률 재계산
    if (updateData.capacity || updateData.current_occupancy) {
      const shelterResult = await getShelter(shelterId);
      if (shelterResult.success) {
        const currentShelter = shelterResult.shelter;
        const capacity = updateData.capacity || currentShelter.capacity;
        const occupancy = updateData.current_occupancy !== undefined ? 
          updateData.current_occupancy : currentShelter.current_occupancy;
        
        updatedData.occupancy_rate = Math.round((occupancy / capacity) * 100);
      }
    }
    
    await updateDoc(doc(db, 'shelters', shelterId), updatedData);
    
    return {
      success: true,
      shelter: updatedData,
      message: '대피소 정보가 업데이트되었습니다.'
    };
  } catch (error) {
    console.error('대피소 업데이트 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'shelter-update-failed',
        message: error.message || '대피소 정보 업데이트 중 오류가 발생했습니다.'
      }
    };
  }
};

// 대피소 삭제
export const deleteShelter = async (shelterId) => {
  try {
    await deleteDoc(doc(db, 'shelters', shelterId));
    
    return {
      success: true,
      message: '대피소 정보가 삭제되었습니다.'
    };
  } catch (error) {
    console.error('대피소 삭제 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'shelter-delete-failed',
        message: error.message || '대피소 삭제 중 오류가 발생했습니다.'
      }
    };
  }
};

// 재난 유형별 대피소 조회
export const getSheltersByDisasterType = async (disasterType) => {
  try {
    const q = query(
      collection(db, 'shelters'), 
      where('disaster_type', '==', disasterType),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const shelters = [];
    querySnapshot.forEach((doc) => {
      shelters.push(doc.data());
    });
    
    return {
      success: true,
      shelters: shelters
    };
  } catch (error) {
    console.error('재난 유형별 대피소 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'disaster-shelters-fetch-failed',
        message: error.message || '재난 유형별 대피소 조회 중 오류가 발생했습니다.'
      }
    };
  }
};

// 대피소 존재 여부 확인
export const checkShelterExists = async (shelterId) => {
  try {
    const shelterDoc = await getDoc(doc(db, 'shelters', shelterId));
    return shelterDoc.exists();
  } catch (error) {
    console.error('대피소 존재 확인 실패:', error);
    return false;
  }
}; 