import { Button, Typography, Form, Input, message, Space, Select, Row, Col, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'

const { Title, } = Typography
const { Option } = Select

import { COLORS } from '../styles/colors';

import { getShelter, updateShelter, createShelter, DISASTER_TYPES, SHELTER_STATUS } from '../services/shelterService';

const disasterTypes = Object.values(DISASTER_TYPES);

const booleanOptions = [
    { label: '여', value: true },
    { label: '부', value: false }
];

const operationStatusOptions = Object.values(SHELTER_STATUS).map(status => ({
    label: status,
    value: status
}));


const EditSetting = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const selectedId = useShelterStore((s)=>s.selectedId)
    const { user } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [shelter, setShelter] = useState(null)
    const [isNewShelter, setIsNewShelter] = useState(false)

    // 대피소 정보 로드
    useEffect(() => {
        const loadShelterData = async () => {
            if (!selectedId || selectedId === 'new') {
                // 새 대피소 생성 모드
                setIsNewShelter(true)
                setIsLoading(false)
                return
            }

            try {
                const result = await getShelter(selectedId)
                if (result.success) {
                    setShelter(result.shelter)
                    // 폼 초기값 설정
                    form.setFieldsValue({
                        shelterName: result.shelter.shelter_name,
                        location: result.shelter.location,
                        disasterType: result.shelter.disaster_type,
                        capacity: result.shelter.capacity,
                        currentOccupancy: result.shelter.current_occupancy,
                        hasDisabledFacility: result.shelter.has_disabled_facility,
                        hasPetZone: result.shelter.has_pet_zone,
                        status: result.shelter.status,
                        contactPerson: result.shelter.contact_person,
                        contactPhone: result.shelter.contact_phone,
                        latitude: result.shelter.latitude,
                        longitude: result.shelter.longitude
                    })
                } else {
                    message.error('대피소 정보를 불러올 수 없습니다.')
                    navigate('/home')
                }
            } catch (error) {
                message.error('대피소 정보를 불러오는 중 오류가 발생했습니다.')
                console.error('대피소 조회 오류:', error)
                navigate('/home')
            } finally {
                setIsLoading(false)
            }
        }

        loadShelterData()
    }, [selectedId, form, navigate])

    const handleSubmit = async (values) => {
        setIsSubmitting(true)
        
        try {
            const shelterData = {
                shelterName: values.shelterName,
                location: values.location,
                disasterType: values.disasterType,
                capacity: values.capacity,
                currentOccupancy: values.currentOccupancy || 0,
                hasDisabledFacility: values.hasDisabledFacility || false,
                hasPetZone: values.hasPetZone || false,
                status: values.status,
                contactPerson: values.contactPerson,
                contactPhone: values.contactPhone,
                managerId: user?.uid,
                latitude: values.latitude,
                longitude: values.longitude
            }

            let result;
            if (isNewShelter) {
                // 새 대피소 생성
                result = await createShelter(shelterData)
            } else {
                // 기존 대피소 업데이트
                result = await updateShelter(selectedId, shelterData)
            }

            if (result.success) {
                message.success(result.message)
                if (isNewShelter) {
                    // 새로 생성된 대피소로 이동
                    navigate(`/setting/${result.shelter_id}`)
                } else {
                    navigate(`/setting/${selectedId}`)
                }
            } else {
                message.error(result.error.message)
            }
        } catch (error) {
            message.error('저장 중 오류가 발생했습니다.')
            console.error('대피소 저장 오류:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        if (isNewShelter) {
            navigate('/home')
        } else {
            navigate(`/setting/${selectedId}`)
        }
    }

    // 로딩 중일 때 표시
    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <div>대피소 정보를 불러오는 중...</div>
            </div>
        )
    }

    return (
        <>
            <Title level={1}>
                {isNewShelter ? '대피소 정보 등록' : '대피소 정보 수정'}
            </Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleCancel} disabled={isSubmitting}>취소</Button>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            style={{ backgroundColor: COLORS.primary }}
                            loading={isSubmitting}
                        >
                            {isNewShelter ? '등록' : '저장'}
                        </Button>
                    </Space>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="대피소명"
                            name="shelterName"
                            rules={[{ required: true, message: "대피소명을 입력해주세요" }]}
                        >
                            <Input placeholder="예: 동작구민회관 대피소" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="대피소 주소"
                            name="location"
                            rules={[{ required: true, message: "대피소 주소를 입력해주세요" }]}
                        >
                            <Input placeholder="예: 서울시 동작구 상도로 123" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item 
                            label="위도"
                            name="latitude"
                            rules={[{ required: true, message: "위도를 입력해주세요" }]}
                        >
                            <Input type="number" step="0.000001" placeholder="예: 37.4932" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="경도"
                            name="longitude"
                            rules={[{ required: true, message: "경도를 입력해주세요" }]}
                        >
                            <Input type="number" step="0.000001" placeholder="예: 126.9538" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="발생 재난 유형"
                            name="disasterType"
                            rules={[{ required: true, message: "발생 재난 유형을 선택해주세요" }]}
                        >
                        <Select placeholder="선택">
                            {disasterTypes.map((type) => (
                            <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="담당자 성명"
                            name="contactPerson" 
                            rules={[{ required: true, message: "담당자 성명을 입력해주세요" }]}
                        >
                            <Input placeholder="예: 김공무원" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="담당자 연락처"
                            name="contactPhone"
                            rules={[
                                { required: true, message: "담당자 연락처를 입력해주세요" },
                                { pattern: /^010-\d{4}-\d{4}$/, message: "010-0000-0000 형식으로 입력해주세요" }
                            ]}
                        >
                            <Input placeholder="010-0000-0000" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="대피소 운영 상태"
                            name="status"
                            rules={[{ required: true, message: "대피소 운영 상태를 선택해주세요" }]}
                        >
                            <Select placeholder="선택" options={operationStatusOptions} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="수용 가능 인원수"
                            name="capacity"
                            rules={[{ required: true, message: "수용 가능 인원수를 입력해주세요" }]}
                        >
                            <Input type="number" min="1" placeholder="예: 150" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="현재 수용 인원수"
                            name="currentOccupancy"
                            rules={[{ required: true, message: "현재 수용 인원수를 입력해주세요" }]}
                        >
                            <Input type="number" min="0" placeholder="예: 97" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="장애인 편의시설 여부"
                            name="hasDisabledFacility"
                            rules={[{ required: true, message: "장애인 편의시설 여부를 선택해주세요" }]}
                        >
                            <Select placeholder="선택" options={booleanOptions} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="반려동물 수용 가능 여부"
                            name="hasPetZone"
                            rules={[{ required: true, message: "반려동물 수용 가능 여부를 선택해주세요" }]}
                        >
                            <Select placeholder="선택" options={booleanOptions} />
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </>
    )
}

export default EditSetting;