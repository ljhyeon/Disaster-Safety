import { Button, Typography, Form, Input, message, Space, Select, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'

const { Title, } = Typography
const { Option } = Select

import { COLORS } from '../styles/colors';

import { shelterInfo } from '../dummydata/settingData';

const disasterTypes = [
    '산사태', '조수', '지진', '폭염', '풍수해(태풍,호우,대설)', '한파', '감염병',
    '다중밀집건축물붕괴대형사고', '댐사고', '산불', '원자력안전 사고', '초미세먼지 재난', '해양선박사고'
]

const booleanOptions = [
    { label: '여', value: '여' },
    { label: '부', value: '부' }
];

const operationStatusOptions = [
    { label: '운영', value: '운영' },
    { label: '미운영', value: '미운영' }
];

// shelterInfo에서 Form의 기본값으로 가공
const initialFormValues = {
    name: shelterInfo.name,
    code: shelterInfo.code,
    address: shelterInfo.address,
    manager: shelterInfo.manager,
    contact: shelterInfo.contact,
    disasterType: shelterInfo.disasterType,
    status: shelterInfo.status,
    accessible: shelterInfo.accessible,
    petAllowed: shelterInfo.petAllowed,
    capacity: parseInt(shelterInfo.capacity.replace(/[^0-9]/g, '')), // "5000명" → 5000
};


const EditSetting = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const selectedId = useShelterStore((s)=>s.selectedId)

    const handleSubmit = async (values) => {
        try {
            // ✅ 여기에 실제 API 요청 추가
            
            console.log('등록 요청 데이터:', values);

            message.success('등록되었습니다!');
            navigate(`/setting/${selectedId}`);
        } catch (error) {
            message.error('등록에 실패했습니다.', error);
        }
    }

    const handleCancel = () => {
        navigate(`/setting/${selectedId}`);
    }

    return (
        <>
            <Title level={1}>
                대피소 설정
            </Title>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialFormValues}
                onFinish={handleSubmit}
            >
                <Form.Item style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleCancel}>취소</Button>
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: COLORS.primary }}>저장</Button>
                    </Space>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="대피소명"
                            name="name"
                            rules={[{ required: true, message: "대피소명을 입력해주세요" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="대피소 코드"
                            name="code"
                            rules={[{ required: true, message: "대피소 코드를 입력해주세요" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="대피소 주소"
                            name="address"
                            rules={[{ required: true, message: "대피소 주소를 입력해주세요" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item 
                            label="최고 담당자 성명"
                            name="manager" 
                            rules={[{ required: true, message: "최고 담당자 성명을 입력해주세요" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="최고 담당자 연락처"
                            name="contact"
                            rules={[{ required: true, message: "최고 담당자 연락처를 입력해주세요" }]}
                        >
                        <Input />
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
                            label="대피소 현 운영 상태"
                            name="status"
                            rules={[{ required: true, message: "대피소 운영 상태를 선택해주세요" }]}
                        >
                            <Select placeholder="선택" options={operationStatusOptions} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="장애인 편의시설 여부"
                            name="accessible"
                            rules={[{ required: true, message: "장애인 편의시설 여부를 선택해주세요" }]}
                        >
                            <Select placeholder="선택" options={booleanOptions} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="반려동물 수용 가능 여부"
                            name="petAllowed"
                            rules={[{ required: true, message: "반려동물 수용 가능 여부를 선택해주세요" }]}
                        >
                            <Select placeholder="선택" options={booleanOptions} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="수용가능 인원수"
                            name="capacity"
                            rules={[{ required: true, message: "수용가능 인원수를 입력해주세요" }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </>
    )
}

export default EditSetting;