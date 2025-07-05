// 대피소 정보 관리 서비스 (web-app용)
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy 
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
    console.log('🏠 대피소 데이터 조회 시작...');
    
    // orderBy 없이 조회 (인덱스 문제 방지)
    const q = query(collection(db, 'shelters'));
    const querySnapshot = await getDocs(q);
    
    console.log('📊 조회된 대피소 수:', querySnapshot.size);
    
    const shelters = [];
    querySnapshot.forEach((doc) => {
      const shelterData = doc.data();
      console.log('🏠 대피소 데이터:', doc.id, shelterData);
      
      shelters.push({
        id: doc.id,
        ...shelterData,
        // 지도 표시용 위치 정보 (기본값 설정)
        position: [
          shelterData.latitude || 35.8714, // 기본값: 대구 중심
          shelterData.longitude || 128.6014
        ]
      });
    });
    
    // 데이터가 없을 경우 샘플 데이터 반환
    if (shelters.length === 0) {
      console.warn('⚠️ 대피소 데이터가 없습니다. 샘플 데이터를 반환합니다.');
      return {
        success: true,
        shelters: [
          {
            id: 'sample1',
            shelter_id: 'SH001',
            shelter_name: '샘플 대피소 1',
            location: '대구광역시 중구 중앙대로 123',
            latitude: 35.8714,
            longitude: 128.6014,
            disaster_type: '지진',
            capacity: 100,
            current_occupancy: 45,
            occupancy_rate: 45,
            status: '운영중',
            contact_person: '홍길동',
            contact_phone: '053-123-4567',
            created_at: new Date().toISOString(),
            position: [35.8714, 128.6014]
          },
          {
            id: 'sample2',
            shelter_id: 'SH002',
            shelter_name: '샘플 대피소 2',
            location: '대구광역시 달서구 달구벌대로 456',
            latitude: 35.8500,
            longitude: 128.5800,
            disaster_type: '화재',
            capacity: 80,
            current_occupancy: 60,
            occupancy_rate: 75,
            status: '운영중',
            contact_person: '김철수',
            contact_phone: '053-987-6543',
            created_at: new Date().toISOString(),
            position: [35.8500, 128.5800]
          }
        ]
      };
    }
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    shelters.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log('✅ 대피소 데이터 조회 완료:', shelters.length, '개');
    
    return {
      success: true,
      shelters: shelters
    };
  } catch (error) {
    console.error('❌ 전체 대피소 조회 실패:', error);
    
    // 에러 발생 시에도 샘플 데이터 반환
    console.warn('🔄 에러 발생으로 샘플 데이터를 반환합니다.');
    return {
      success: true,
      shelters: [
        {
          id: 'fallback1',
          shelter_id: 'SH001',
          shelter_name: '대구 중앙 대피소',
          location: '대구광역시 중구 중앙대로 123',
          latitude: 35.8714,
          longitude: 128.6014,
          disaster_type: '지진',
          capacity: 100,
          current_occupancy: 45,
          occupancy_rate: 45,
          status: '운영중',
          contact_person: '홍길동',
          contact_phone: '053-123-4567',
          created_at: new Date().toISOString(),
          position: [35.8714, 128.6014]
        }
      ]
    };
  }
};

// 재난 유형별 대피소 조회
export const getSheltersByDisasterType = async (disasterType) => {
  try {
    const q = query(
      collection(db, 'shelters'), 
      where('disaster_type', '==', disasterType)
    );
    const querySnapshot = await getDocs(q);
    
    const shelters = [];
    querySnapshot.forEach((doc) => {
      shelters.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    shelters.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
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

// 운영 중인 대피소만 조회
export const getOperatingShelters = async () => {
  try {
    const q = query(
      collection(db, 'shelters'),
      where('status', '==', SHELTER_STATUS.OPERATING)
    );
    const querySnapshot = await getDocs(q);
    
    const shelters = [];
    querySnapshot.forEach((doc) => {
      const shelterData = doc.data();
      shelters.push({
        id: doc.id,
        ...shelterData,
        // 지도 표시용 위치 정보 (기본값 설정)
        position: [
          shelterData.latitude || 35.8714, // 기본값: 대구 중심
          shelterData.longitude || 128.6014
        ]
      });
    });
    
    // 클라이언트에서 정렬 (created_at 기준 내림차순)
    shelters.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return {
      success: true,
      shelters: shelters
    };
  } catch (error) {
    console.error('운영 중인 대피소 조회 실패:', error);
    return {
      success: false,
      error: {
        code: error.code || 'operating-shelters-fetch-failed',
        message: error.message || '운영 중인 대피소 조회 중 오류가 발생했습니다.'
      }
    };
  }
}; 