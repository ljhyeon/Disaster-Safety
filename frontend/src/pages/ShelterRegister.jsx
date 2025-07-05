import { Button, Typography, Form, Input, message, Space, Select, Row, Col, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'

const { Title } = Typography
const { Option } = Select

import { COLORS } from '../styles/colors'
import { createShelter, DISASTER_TYPES, SHELTER_STATUS } from '../services/shelterService'

const ShelterRegister = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const disasterTypes = Object.values(DISASTER_TYPES)

    const booleanOptions = [
        { label: '여', value: true },
        { label: '부', value: false }
    ]

    const operationStatusOptions = Object.values(SHELTER_STATUS).map(status => ({
        label: status,
        value: status
    }))

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

            const result = await createShelter(shelterData)

            if (result.success) {
                message.success(`대피소가 성공적으로 등록되었습니다! (ID: ${result.shelter_id})`)
                form.resetFields()
                // 등록 후 홈으로 이동하거나 계속 등록할 수 있도록 선택지 제공
                setTimeout(() => {
                    navigate('/home')
                }, 2000)
            } else {
                message.error(result.error.message)
            }
        } catch (error) {
            message.error('대피소 등록 중 오류가 발생했습니다.')
            console.error('대피소 등록 오류:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate('/home')
    }

    const handleReset = () => {
        form.resetFields()
        message.info('폼이 초기화되었습니다.')
    }

    // 샘플 데이터 자동 입력
    const fillSampleData = () => {
        const sampleData = {
            shelterName: '대구시민회관 대피소',
            location: '대구시 중구 동성로2가 141',
            latitude: 35.8714,
            longitude: 128.6014,
            disasterType: '지진',
            capacity: 200,
            currentOccupancy: 50,
            hasDisabledFacility: true,
            hasPetZone: false,
            status: '운영중',
            contactPerson: '김담당자',
            contactPhone: '010-1234-5678'
        }
        
        form.setFieldsValue(sampleData)
        message.success('샘플 데이터가 입력되었습니다.')
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f5f5f5', 
            padding: '24px'
        }}>
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto',
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={1} style={{ color: COLORS.primary }}>
                        대피소 등록 시스템
                    </Title>
                    <div style={{ color: '#666', fontSize: '16px' }}>
                        새로운 대피소 정보를 등록합니다
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        hasDisabledFacility: false,
                        hasPetZone: false,
                        status: '운영중',
                        currentOccupancy: 0
                    }}
                >
                    <Card 
                        title="빠른 작업" 
                        size="small" 
                        style={{ marginBottom: '24px' }}
                        extra={
                            <Space>
                                <Button onClick={fillSampleData} type="dashed">
                                    샘플 데이터 입력
                                </Button>
                                <Button onClick={handleReset}>
                                    폼 초기화
                                </Button>
                            </Space>
                        }
                    >
                        <div style={{ color: '#666' }}>
                            샘플 데이터로 빠르게 테스트하거나, 폼을 초기화할 수 있습니다.
                        </div>
                    </Card>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="대피소명"
                                name="shelterName"
                                rules={[{ required: true, message: "대피소명을 입력해주세요" }]}
                            >
                                <Input placeholder="예: 대구시민회관 대피소" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="대피소 주소"
                                name="location"
                                rules={[{ required: true, message: "대피소 주소를 입력해주세요" }]}
                            >
                                <Input placeholder="예: 대구시 중구 동성로2가 141" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="위도 (Latitude)"
                                name="latitude"
                                rules={[{ required: true, message: "위도를 입력해주세요" }]}
                            >
                                <Input 
                                    type="number" 
                                    step="0.000001" 
                                    placeholder="예: 35.8714" 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="경도 (Longitude)"
                                name="longitude"
                                rules={[{ required: true, message: "경도를 입력해주세요" }]}
                            >
                                <Input 
                                    type="number" 
                                    step="0.000001" 
                                    placeholder="예: 128.6014" 
                                />
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
                        <Col span={12}>
                            <Form.Item
                                label="장애인 편의시설 여부"
                                name="hasDisabledFacility"
                                rules={[{ required: true, message: "장애인 편의시설 여부를 선택해주세요" }]}
                            >
                                <Select placeholder="선택" options={booleanOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="반려동물 수용 가능 여부"
                                name="hasPetZone"
                                rules={[{ required: true, message: "반려동물 수용 가능 여부를 선택해주세요" }]}
                            >
                                <Select placeholder="선택" options={booleanOptions} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Space size="large">
                            <Button 
                                size="large"
                                onClick={handleCancel} 
                                disabled={isSubmitting}
                            >
                                취소
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large"
                                style={{ 
                                    backgroundColor: COLORS.primary,
                                    minWidth: '120px'
                                }}
                                loading={isSubmitting}
                            >
                                대피소 등록
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>

                <div style={{ 
                    marginTop: '32px', 
                    padding: '16px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <strong>💡 도움말:</strong>
                    <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                        <li>위도/경도는 Google Maps에서 확인할 수 있습니다.</li>
                        <li>샘플 데이터 버튼으로 빠르게 테스트할 수 있습니다.</li>
                        <li>등록 후 자동으로 홈 화면으로 이동합니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ShelterRegister 