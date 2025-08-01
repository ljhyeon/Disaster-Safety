import { Button, Typography, Form, Input, message, Space, Select, Row, Col, Card, Upload, Table, Modal, Divider } from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'
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
    
    // CSV 업로드 관련 상태
    const [csvData, setCsvData] = useState([])
    const [csvColumns, setCsvColumns] = useState([])
    const [showMappingModal, setShowMappingModal] = useState(false)
    const [columnMapping, setColumnMapping] = useState({})
    const [isBulkUploading, setIsBulkUploading] = useState(false)

    const disasterTypes = Object.values(DISASTER_TYPES)

    const booleanOptions = [
        { label: '여', value: true },
        { label: '부', value: false }
    ]

    // Firebase 필드 매핑 옵션
    const firebaseFields = [
        { label: '대피소명', value: 'shelterName' },
        { label: '주소', value: 'location' },
        { label: '위도', value: 'latitude' },
        { label: '경도', value: 'longitude' },
        { label: '재난유형', value: 'disasterType' },
        { label: '수용가능인원', value: 'capacity' },
        { label: '현재수용인원', value: 'currentOccupancy' },
        { label: '장애인편의시설', value: 'hasDisabledFacility' },
        { label: '반려동물수용', value: 'hasPetZone' },
        { label: '운영상태', value: 'status' },
        { label: '담당자명', value: 'contactPerson' },
        { label: '담당자연락처', value: 'contactPhone' }
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

    // CSV 파일 처리
    const handleCSVUpload = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target.result
            const lines = text.split('\n').filter(line => line.trim())
            
            if (lines.length < 2) {
                message.error('CSV 파일에 데이터가 충분하지 않습니다.')
                return
            }
            
            const headers = lines[0].split('|').map(h => h.trim().replace(/"/g, ''))
            const rows = lines.slice(1).map(line => {
                const values = line.split('|').map(v => v.trim().replace(/"/g, ''))
                const row = {}
                headers.forEach((header, index) => {
                    row[header] = values[index] || ''
                })
                return row
            })
            
            setCsvColumns(headers)
            setCsvData(rows)
            setShowMappingModal(true)
        }
        reader.readAsText(file, 'utf-8')
        return false // prevent default upload
    }

    // 컬럼 매핑 처리
    const handleMappingConfirm = async () => {
        const mappedFields = Object.values(columnMapping).filter(Boolean)
        if (mappedFields.length === 0) {
            message.error('최소 하나의 필드는 매핑해야 합니다.')
            return
        }

        setIsBulkUploading(true)
        let successCount = 0
        let errorCount = 0

        try {
            for (const row of csvData) {
                const shelterData = {
                    managerId: user?.uid
                }

                // 매핑된 필드들 처리
                Object.entries(columnMapping).forEach(([csvColumn, firebaseField]) => {
                    if (firebaseField && row[csvColumn]) {
                        let value = row[csvColumn]
                        
                        // 데이터 타입 변환
                        if (firebaseField === 'latitude' || firebaseField === 'longitude') {
                            value = parseFloat(value)
                        } else if (firebaseField === 'capacity' || firebaseField === 'currentOccupancy') {
                            value = parseInt(value)
                        } else if (firebaseField === 'hasDisabledFacility' || firebaseField === 'hasPetZone') {
                            value = value === '여' || value === 'true' || value === '1' || value === 'Y'
                        }
                        
                        shelterData[firebaseField] = value
                    }
                })

                // 기본값 설정
                if (!shelterData.currentOccupancy) shelterData.currentOccupancy = 0
                if (!shelterData.hasDisabledFacility) shelterData.hasDisabledFacility = false
                if (!shelterData.hasPetZone) shelterData.hasPetZone = false
                if (!shelterData.status) shelterData.status = '운영중'
                if (!shelterData.disasterType) shelterData.disasterType = '지진'

                const result = await createShelter(shelterData)
                if (result.success) {
                    successCount++
                } else {
                    errorCount++
                    console.error('대피소 등록 실패:', result.error)
                }
            }

            message.success(`총 ${csvData.length}개 중 ${successCount}개 성공, ${errorCount}개 실패`)
            
            if (successCount > 0) {
                setCsvData([])
                setCsvColumns([])
                setColumnMapping({})
                setShowMappingModal(false)
            }
        } catch (error) {
            message.error('벌크 업로드 중 오류가 발생했습니다.')
            console.error('벌크 업로드 오류:', error)
        } finally {
            setIsBulkUploading(false)
        }
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
            minWidth: '100vw',
            backgroundColor: '#f5f5f5', 
            overflowX: 'hidden'
        }}>
            <div style={{ 
                maxWidth: '100%', 
                margin: '0 auto',
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflowX: 'hidden'
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

                    <Card 
                        title="CSV 파일 일괄 업로드" 
                        size="small" 
                        style={{ marginBottom: '24px' }}
                    >
                        <div style={{ marginBottom: '16px', color: '#666' }}>
                            CSV 파일을 업로드하여 여러 대피소를 한번에 등록할 수 있습니다.
                        </div>
                        <Upload.Dragger
                            accept=".csv"
                            beforeUpload={handleCSVUpload}
                            showUploadList={false}
                            style={{ marginBottom: '16px' }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">CSV 파일을 클릭하거나 드래그하여 업로드</p>
                            <p className="ant-upload-hint">
                                .csv 파일만 지원됩니다. 첫 번째 행은 헤더로 사용됩니다.
                            </p>
                        </Upload.Dragger>
                        {csvData.length > 0 && (
                            <div style={{ color: '#52c41a' }}>
                                ✓ {csvData.length}개의 데이터가 로드되었습니다. 매핑을 확인해주세요.
                            </div>
                        )}
                    </Card>

                    <Divider>또는 개별 등록</Divider>

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
                        <li>CSV 파일 업로드로 여러 대피소를 한번에 등록할 수 있습니다.</li>
                        <li>등록 후 자동으로 홈 화면으로 이동합니다.</li>
                    </ul>
                </div>
            </div>

            {/* CSV 컬럼 매핑 모달 */}
            <Modal
                title="CSV 컬럼 매핑"
                open={showMappingModal}
                onCancel={() => setShowMappingModal(false)}
                onOk={handleMappingConfirm}
                okText="업로드 시작"
                cancelText="취소"
                width={800}
                confirmLoading={isBulkUploading}
            >
                <div style={{ marginBottom: '16px' }}>
                    <strong>CSV 파일의 컬럼을 Firebase 필드에 매핑해주세요:</strong>
                    <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                        총 {csvData.length}개의 데이터가 업로드됩니다.
                    </div>
                </div>
                
                <Table
                    dataSource={csvColumns.map((column, index) => ({
                        key: index,
                        csvColumn: column,
                        sampleData: csvData[0]?.[column] || '',
                        mapping: columnMapping[column] || ''
                    }))}
                    columns={[
                        {
                            title: 'CSV 컬럼명',
                            dataIndex: 'csvColumn',
                            key: 'csvColumn',
                            width: 200
                        },
                        {
                            title: '샘플 데이터',
                            dataIndex: 'sampleData',
                            key: 'sampleData',
                            width: 200,
                            render: (text) => (
                                <span style={{ color: '#666' }}>
                                    {text || '(빈 값)'}
                                </span>
                            )
                        },
                        {
                            title: 'Firebase 필드 매핑',
                            key: 'mapping',
                            render: (_, record) => (
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="필드 선택"
                                    allowClear
                                    value={columnMapping[record.csvColumn]}
                                    onChange={(value) => {
                                        setColumnMapping(prev => ({
                                            ...prev,
                                            [record.csvColumn]: value
                                        }))
                                    }}
                                    options={firebaseFields}
                                />
                            )
                        }
                    ]}
                    pagination={false}
                    size="small"
                />
                
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
                    <strong>💡 매핑 가이드:</strong>
                    <ul style={{ marginTop: '8px', marginBottom: 0, fontSize: '14px' }}>
                        <li>필수 필드: 대피소명, 주소, 위도, 경도</li>
                        <li>장애인편의시설/반려동물수용: '여', 'true', '1', 'Y' → true로 변환</li>
                        <li>매핑하지 않은 필드는 기본값으로 설정됩니다</li>
                    </ul>
                </div>
            </Modal>
        </div>
    )
}

export default ShelterRegister