import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '../../store/authStore';
import { getShelter } from '../../services/shelterService';
import { useAsync } from '../../hooks/useAsync';

const useShelterForm = (selectedId, form) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { data, loading: isLoading, execute: refetch } = useAsync(
        async () => {
            if (!selectedId || selectedId === 'new') {
                return { isNew: true, shelter: null };
            }

            const result = await getShelter(selectedId);

            if (!result.success) {
                message.error('대피소 정보를 불러올 수 없습니다.');
                navigate('/home');
                return { isNew: false, shelter: null };
            }

            return { isNew: false, shelter: result.shelter };
        },
        [selectedId],
        {
            onSuccess: ({ isNew, shelter }) => {
                if (isNew) return;

                form.setFieldsValue({
                    shelterName: shelter.shelter_name,
                    location: shelter.location,
                    disasterType: shelter.disaster_type,
                    capacity: shelter.capacity,
                    currentOccupancy: shelter.current_occupancy,
                    hasDisabledFacility: shelter.has_disabled_facility,
                    hasPetZone: shelter.has_pet_zone,
                    status: shelter.status,
                    contactPerson: shelter.contact_person,
                    contactPhone: shelter.contact_phone,
                    latitude: shelter.latitude,
                    longitude: shelter.longitude,
                });
            },
            onError: (error) => {
                message.error('대피소 정보를 불러오는 중 오류가 발생했습니다.');
                console.error('대피소 조회 오류:', error);
                navigate('/home');
            },
        }
    );

    const isNewShelter = data?.isNew || false;
    const shelter = data?.shelter || null;

    return { shelter, isNewShelter, isLoading, refetch, user };
};

export default useShelterForm;
