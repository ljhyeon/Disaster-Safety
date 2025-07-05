import { Typography, Input, Button, Form, message, Space, Card, Select, Row, Col, InputNumber } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { StatusList } from '../components/StatusList'

const { Title, } = Typography
const { Option } = Select

import { useShelterStore } from '../store/useShelterStore'
import { useAuthStore } from '../store/authStore'

import { createReliefRequest, RELIEF_CATEGORIES, RELIEF_SUBCATEGORIES } from '../services/reliefService'
import { recommendData } from '../dummydata/recommendData'

const AddProduct = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const { id } = useParams()
    const selectedId = useShelterStore((s)=>s.selectedId)
    const setSelectedId = useShelterStore((s)=>s.setSelectedId)
    const { user } = useAuthStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [reliefItems, setReliefItems] = useState([])

    // URL 파라미터의 id를 store에 설정
    useEffect(() => {
        if (id && id !== selectedId) {
            setSelectedId(id)
        }
    }, [id, selectedId, setSelectedId])

    // 카테고리 변경 시 서브카테고리 초기화
    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        form.setFieldValue('subcategory', undefined)
        form.setFieldValue('item', undefined)
    }

    // 구호품 아이템 추가
    const addReliefItem = () => {
        const values = form.getFieldsValue()
        const { category, subcategory, item, quantity, unit, priority, notes } = values

        if (!category || !subcategory || !item || !quantity || !unit) {
            message.error('모든 구호품 정보를 입력해주세요.')
            return
        }

        const newItem = {
            category,
            subcategory,
            item,
            quantity: parseInt(quantity),
            unit,
            priority: priority || 'normal',
            notes: notes || ''
        }

        setReliefItems([...reliefItems, newItem])
        
        // 폼 일부 필드 초기화 (카테고리는 유지)
        form.setFieldsValue({
            subcategory: undefined,
            item: '',
            quantity: undefined,
            unit: '',
            notes: ''
        })
        
        message.success('구호품이 목록에 추가되었습니다.')
    }

    // 구호품 아이템 제거
    const removeReliefItem = (index) => {
        const newItems = reliefItems.filter((_, i) => i !== index)
        setReliefItems(newItems)
        message.success('구호품이 목록에서 제거되었습니다.')
    }

    const handleSubmit = async () => {
        if (reliefItems.length === 0) {
            message.error('최소 1개 이상의 구호품을 추가해주세요.')
            return
        }

        const currentShelterId = selectedId || id
        if (!currentShelterId) {
            message.error('대피소가 선택되지 않았습니다.')
            return
        }

        if (!user?.uid) {
            message.error('사용자 정보가 없습니다. 다시 로그인해주세요.')
            return
        }

        setIsSubmitting(true)
        
        try {
            const requestData = {
                shelterId: currentShelterId,
                reliefItems: reliefItems,
                requesterId: user.uid,
                priority: 'normal',
                notes: '구호품 요청'
            }

            const result = await createReliefRequest(requestData)

            if (result.success) {
                message.success(result.message)
                navigate(`/list/${currentShelterId}`)
            } else {
                message.error(result.error?.message || '등록 중 오류가 발생했습니다.')
            }
        } catch (error) {
            message.error('등록 중 오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        const currentShelterId = selectedId || id
        navigate(`/list/${currentShelterId}`)
    }

    // 사용 가능한 서브카테고리 목록
    const getAvailableSubcategories = () => {
        const categoryKey = Object.keys(RELIEF_CATEGORIES).find(key => RELIEF_CATEGORIES[key] === selectedCategory)
        return categoryKey ? RELIEF_SUBCATEGORIES[categoryKey] || {} : {}
    }

    const availableSubcategories = getAvailableSubcategories()

    // 단위 옵션
    const unitOptions = [
        { label: '개', value: '개' },
        { label: '팩', value: '팩' },
        { label: '박스', value: '박스' },
        { label: '병', value: '병' },
        { label: '캔', value: '캔' },
        { label: '장', value: '장' },
        { label: 'kg', value: 'kg' },
        { label: 'L', value: 'L' },
        { label: '세트', value: '세트' }
    ]

    // 우선순위 옵션
    const priorityOptions = [
        { label: '긴급', value: 'urgent' },
        { label: '높음', value: 'high' },
        { label: '보통', value: 'normal' },
        { label: '낮음', value: 'low' }
    ]

    return (
        <>
            <Title level={1}>
                필요 구호품 등록
            </Title>
            
            <Form
                form={form}
                layout="vertical"
                initialValues={{ priority: 'normal' }}
            >
                <Form.Item style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleCancel} disabled={isSubmitting}>취소</Button>
                        <Button 
                            type="primary" 
                            onClick={handleSubmit}
                            style={{ backgroundColor: '#001f91' }}
                            loading={isSubmitting}
                            disabled={reliefItems.length === 0}
                        >
                            등록 ({reliefItems.length}개 항목)
                        </Button>
                    </Space>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="대분류"
                            name="category"
                            rules={[{ required: true, message: '대분류를 선택해주세요' }]}
                        >
                            <Select 
                                placeholder="선택" 
                                onChange={handleCategoryChange}
                                allowClear
                            >
                                {Object.entries(RELIEF_CATEGORIES).map(([key, value]) => (
                                    <Option key={key} value={value}>{value}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="중분류"
                            name="subcategory"
                            rules={[{ required: true, message: '중분류를 선택해주세요' }]}
                        >
                            <Select 
                                placeholder="대분류를 먼저 선택하세요" 
                                disabled={!selectedCategory}
                                allowClear
                            >
                                {Object.entries(availableSubcategories).map(([key, value]) => (
                                    <Option key={key} value={value}>{value}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="우선순위"
                            name="priority"
                        >
                            <Select options={priorityOptions} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="구호품 명칭"
                            name="item"
                            rules={[{ required: true, message: '구호품 명칭을 입력해주세요' }]}
                        >
                            <Input placeholder="예: 생수, 컵라면, 휴지 등" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="필요 수량"
                            name="quantity"
                            rules={[{ required: true, message: '수량을 입력해주세요' }]}
                        >
                            <InputNumber 
                                min={1} 
                                placeholder="예: 100"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="단위"
                            name="unit"
                            rules={[{ required: true, message: '단위를 선택해주세요' }]}
                        >
                            <Select placeholder="선택" options={unitOptions} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={20}>
                        <Form.Item
                            label="조건/메모"
                            name="notes"
                        >
                            <Input placeholder="예: 크기 관계 없음, 유통기한 1개월 이상 등" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label=" " style={{ marginTop: '30px' }}>
                            <Button 
                                type="dashed" 
                                onClick={addReliefItem}
                                style={{ width: '100%' }}
                            >
                                목록에 추가
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {/* 추가된 구호품 목록 */}
            {reliefItems.length > 0 && (
                <Card title={`등록할 구호품 목록 (${reliefItems.length}개)`} style={{ marginTop: '24px' }}>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {reliefItems.map((item, index) => (
                            <div key={index} style={{ 
                                padding: '12px', 
                                borderBottom: index < reliefItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                        {item.item} ({item.quantity}{item.unit})
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {item.category} &gt; {item.subcategory} • 
                                        우선순위: {
                                            item.priority === 'urgent' ? '긴급' :
                                            item.priority === 'high' ? '높음' :
                                            item.priority === 'normal' ? '보통' : '낮음'
                                        } • 
                                        {item.notes && `메모: ${item.notes}`}
                                    </div>
                                </div>
                                <Button 
                                    type="text" 
                                    danger 
                                    size="small"
                                    onClick={() => removeReliefItem(index)}
                                >
                                    제거
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card title="추천 정보" style={{ marginTop: '24px' }}>
                <StatusList cnt={recommendData.length} data={recommendData} />
            </Card>
        </>
    )
}

export default AddProduct;