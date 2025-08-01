import { Typography, Input, Button, Form, message, Space, Card, Select, Row, Col, InputNumber, Tag, Alert, Divider } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { StatusList } from '../components/StatusList'

const { Title, Text } = Typography
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

    // URL 파라미터의 id를 store에 설정
    useEffect(() => {
        if (id && id !== selectedId) {
            setSelectedId(id)
        }
    }, [id, selectedId, setSelectedId])

    // AI 추천으로 설정된 상태를 추적하는 플래그
    const [isAIRecommendationApplied, setIsAIRecommendationApplied] = useState(false)

    // 카테고리 변경 시 서브카테고리 초기화 (AI 추천 적용 시에는 제외)
    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        // AI 추천으로 설정된 경우가 아닐 때만 필드 초기화
        if (!isAIRecommendationApplied) {
            form.setFieldValue('subcategory', undefined)
            form.setFieldValue('item', undefined)
        }
        // AI 추천 플래그 리셋
        setIsAIRecommendationApplied(false)
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            
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
            
            const requestData = {
                shelterId: currentShelterId,
                reliefItems: [{
                    category: values.category,
                    subcategory: values.subcategory,
                    item: values.item,
                    quantity: parseInt(values.quantity),
                    unit: values.unit,
                    priority: values.priority || 'normal',
                    notes: values.notes || ''
                }],
                requesterId: user.uid,
                priority: values.priority || 'normal',
                notes: values.notes || '구호품 요청'
            }

            const result = await createReliefRequest(requestData)

            if (result.success) {
                message.success(result.message)
                navigate(`/list/${currentShelterId}`)
            } else {
                message.error(result.error?.message || '등록 중 오류가 발생했습니다.')
            }
        } catch (error) {
            if (error.errorFields) {
                message.error('필수 정보를 모두 입력해주세요.')
            } else {
                message.error('등록 중 오류가 발생했습니다.')
            }
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

    // AI 추천 더미 데이터 - 지진과 화재 재난 시나리오
    const getAIRecommendations = () => {
        const scenarios = [
            // 지진 재난 시나리오
            {
                predictions: [
                    {
                        category: "안전용품",
                        item: "안전모",
                        currentStock: 15,
                        predictedNeed: 80,
                        shortage: 65,
                        unit: "개",
                        priority: "urgent",
                        reason: "여진 발생 시 낙하물로부터 머리 보호 필수"
                    },
                    {
                        category: "의료용품",
                        item: "일회용 붕대",
                        currentStock: 30,
                        predictedNeed: 120,
                        shortage: 90,
                        unit: "롤",
                        priority: "urgent",
                        reason: "지진으로 인한 외상 환자 급증 예상"
                    },
                    {
                        category: "생활용품",
                        item: "LED 손전등",
                        currentStock: 25,
                        predictedNeed: 100,
                        shortage: 75,
                        unit: "개",
                        priority: "high",
                        reason: "정전 상황 대비 필수품"
                    },
                    {
                        category: "식품",
                        item: "참치캔",
                        currentStock: 40,
                        predictedNeed: 200,
                        shortage: 160,
                        unit: "캔",
                        priority: "high",
                        reason: "조리 시설 파손 시 즉석 섭취 가능 식품"
                    },
                    {
                        category: "식품",
                        item: "생수 2L",
                        currentStock: 50,
                        predictedNeed: 300,
                        shortage: 250,
                        unit: "병",
                        priority: "urgent",
                        reason: "상수도 시설 파손으로 인한 급수 중단"
                    },
                    {
                        category: "생활용품",
                        item: "알카라인 건전지 AA",
                        currentStock: 60,
                        predictedNeed: 200,
                        shortage: 140,
                        unit: "개",
                        priority: "high",
                        reason: "손전등 및 라디오 작동용"
                    },
                    {
                        category: "식품",
                        item: "컵라면",
                        currentStock: 80,
                        predictedNeed: 300,
                        shortage: 220,
                        unit: "개",
                        priority: "normal",
                        reason: "간편 조리 가능한 비상식품"
                    },
                    {
                        category: "의료용품",
                        item: "소독용 에탄올",
                        currentStock: 10,
                        predictedNeed: 50,
                        shortage: 40,
                        unit: "병",
                        priority: "high",
                        reason: "상처 소독 및 감염 예방"
                    }
                ],
                historicalCases: [
                    {
                        location: "경주시 임시대피소",
                        disaster: "지진 5.8규모",
                        year: "2016",
                        items: ["안전모", "LED 손전등", "알카라인 건전지", "응급처치키트"]
                    },
                    {
                        location: "포항시 북구 대피소",
                        disaster: "지진 5.4규모",
                        year: "2017",
                        items: ["텐트", "침낭", "휴대용 라디오", "생수 2L"]
                    },
                    {
                        location: "일본 구마모토 대피소",
                        disaster: "지진 7.0규모",
                        year: "2016",
                        items: ["방재헬멧", "비상식량", "휴대용 가스버너", "담요"]
                    }
                ]
            },
            // 화재 재난 시나리오
            {
                predictions: [
                    {
                        category: "의료용품",
                        item: "화상치료연고",
                        currentStock: 8,
                        predictedNeed: 40,
                        shortage: 32,
                        unit: "개",
                        priority: "urgent",
                        reason: "화재로 인한 화상 환자 응급처치"
                    },
                    {
                        category: "위생용품",
                        item: "KF94 마스크",
                        currentStock: 100,
                        predictedNeed: 300,
                        shortage: 200,
                        unit: "개",
                        priority: "urgent",
                        reason: "연기 흡입 방지 및 호흡기 보호"
                    },
                    {
                        category: "의류",
                        item: "면 속옷세트",
                        currentStock: 20,
                        predictedNeed: 150,
                        shortage: 130,
                        unit: "세트",
                        priority: "high",
                        reason: "화재로 인한 의류 소실, 기본 의류 필요"
                    },
                    {
                        category: "생활용품",
                        item: "칫솔치약세트",
                        currentStock: 15,
                        predictedNeed: 80,
                        shortage: 65,
                        unit: "세트",
                        priority: "normal",
                        reason: "개인 위생 관리용품 소실"
                    },
                    {
                        category: "식품",
                        item: "생수 500ml",
                        currentStock: 200,
                        predictedNeed: 600,
                        shortage: 400,
                        unit: "병",
                        priority: "urgent",
                        reason: "탈수 방지 및 수분 보충"
                    },
                    {
                        category: "의료용품",
                        item: "인공호흡용 산소마스크",
                        currentStock: 5,
                        predictedNeed: 25,
                        shortage: 20,
                        unit: "개",
                        priority: "urgent",
                        reason: "연기 흡입으로 인한 호흡곤란 응급처치"
                    },
                    {
                        category: "생활용품",
                        item: "수건",
                        currentStock: 30,
                        predictedNeed: 120,
                        shortage: 90,
                        unit: "장",
                        priority: "high",
                        reason: "화상 부위 냉각 및 개인 위생"
                    },
                    {
                        category: "식품",
                        item: "핫초코믹스",
                        currentStock: 20,
                        predictedNeed: 100,
                        shortage: 80,
                        unit: "개",
                        priority: "normal",
                        reason: "심리적 안정감 제공 및 체온 유지"
                    }
                ],
                historicalCases: [
                    {
                        location: "강원도 고성군 대피소",
                        disaster: "산불",
                        year: "2019",
                        items: ["KF94 마스크", "면 속옷세트", "칫솔치약세트", "화상치료연고"]
                    },
                    {
                        location: "울진군 임시대피소",
                        disaster: "대형산불",
                        year: "2022",
                        items: ["공기청정기", "인공눈물", "목캔디", "담요"]
                    },
                    {
                        location: "속초시 설악동 대피소",
                        disaster: "산불",
                        year: "2023",
                        items: ["산소마스크", "화상연고", "생리식염수", "거즈"]
                    }
                ]
            }
        ]

        // 랜덤하게 지진 또는 화재 시나리오 선택
        const randomIndex = Math.floor(Math.random() * 2)
        return scenarios[randomIndex]
    }

    const aiRecommendations = getAIRecommendations()

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
                        >
                            구호품 등록
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
                    <Col span={24}>
                        <Form.Item
                            label="조건/메모"
                            name="notes"
                        >
                            <Input placeholder="예: 크기 관계 없음, 유통기한 1개월 이상 등" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {/* AI 추천 정보 */}
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>구호품 수요 예측 및 추천 AI 결과</span>
                    </div>
                } 
                style={{ marginTop: '12px' }}
            >
                <Divider orientation="left" style={{ marginTop: '0px' }}>예측 부족 물자</Divider>
                
                <div style={{ marginBottom: '16px' }}>
                    {aiRecommendations.predictions.map((pred, index) => (
                        <Card 
                            key={index}
                            size="small" 
                            style={{ marginBottom: '8px' }}
                            className={pred.priority === 'urgent' ? 'urgent-card' : ''}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <Text strong>{pred.item}</Text>
                                        <Tag color={pred.priority === 'urgent' ? 'red' : pred.priority === 'high' ? 'orange' : 'green'}>
                                            {pred.priority === 'urgent' ? '긴급' : pred.priority === 'high' ? '높음' : '보통'}
                                        </Tag>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                        현재 보유: {pred.currentStock}{pred.unit} → 필요 예상: {pred.predictedNeed}{pred.unit}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                                        <Text type="danger">부족 예상: {pred.shortage}{pred.unit}</Text>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                        {pred.reason}
                                    </div>
                                </div>
                                <Button 
                                    type="dashed" 
                                    size="small"
                                    onClick={() => {
                                        // 해당 아이템을 폼에 자동 설정
                                        const getCategoryKey = (category) => {
                                            const categoryMap = {
                                                '식품': 'food',
                                                '위생용품': 'hygiene', 
                                                '의료용품': 'medical',
                                                '생활용품': 'daily',
                                                '안전용품': 'safety',
                                                '의류': 'clothing',
                                                '통신용품': 'communication'
                                            }
                                            return categoryMap[category] || 'other'
                                        }
                                        
                                        const categoryKey = getCategoryKey(pred.category)
                                        const categoryValue = RELIEF_CATEGORIES[categoryKey]
                                        
                                        // 해당 카테고리의 첫 번째 서브카테고리를 자동 선택
                                        const subcategories = RELIEF_SUBCATEGORIES[categoryKey] || {}
                                        const firstSubcategoryKey = Object.keys(subcategories)[0]
                                        const subcategoryValue = firstSubcategoryKey ? subcategories[firstSubcategoryKey] : undefined
                                        
                                        // AI 추천 적용 플래그 설정
                                        setIsAIRecommendationApplied(true)
                                        
                                        form.setFieldsValue({
                                            category: categoryValue,
                                            subcategory: subcategoryValue,
                                            item: pred.item,
                                            quantity: pred.shortage,
                                            unit: pred.unit,
                                            priority: pred.priority
                                        })
                                        setSelectedCategory(categoryValue)
                                        message.success('추천 아이템이 폼에 설정되었습니다')
                                    }}
                                >
                                    폼에 적용
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <Divider orientation="left">유사 사례 기반 추천</Divider>
                
                <div>
                    <Text style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>
                        현재 대피소와 유사한 과거 재난 사례 분석 결과
                    </Text>
                    {aiRecommendations.historicalCases.map((case_, index) => (
                        <div key={index} style={{ marginBottom: '8px', padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                            <Text strong style={{ fontSize: '13px' }}>
                                {case_.location} ({case_.year}년 {case_.disaster})
                            </Text>
                            <div style={{ marginTop: '4px' }}>
                                <Text style={{ fontSize: '12px', color: '#666' }}>추가 필요 물품: </Text>
                                {case_.items.map((item, idx) => (
                                    <Tag key={idx} size="small" style={{ fontSize: '11px' }}>{item}</Tag>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '16px', padding: '8px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                        💡 AI 분석 기반으로 예측된 정보입니다. 실제 상황에 맞게 조정해서 사용하세요.
                    </Text>
                </div>
            </Card>

            <style jsx>{`
                .urgent-card {
                    border-left: 4px solid #ff4d4f;
                    background-color: #fff2f0;
                }
            `}</style>
        </>
    )
}

export default AddProduct;