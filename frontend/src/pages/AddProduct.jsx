import { Typography, Input, Button, Form, message, Space, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { StatusList } from '../components/StatusList'

const { Title, } = Typography

import { useShelterStore } from '../store/useShelterStore'

const dummyData = [
    '비슷한 규모의 대피소 기준, 생수가 100 개 부족합니다.',
    '같은 재난이 발생하였을 때, 담요가 큰 도움이 되었다는 사례가 있습니다.',
]

const AddProduct = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const selectedId = useShelterStore((s)=>s.selectedId)

    const handleSubmit = async (values) => {
        try {
            // ✅ 여기에 실제 API 요청 추가
            
            console.log('등록 요청 데이터:', values);

            message.success('등록되었습니다!');
            navigate(`/list/${selectedId}`);
        } catch (error) {
            message.error('등록에 실패했습니다.', error);
        }
    }

    const handleCancel = () => {
        navigate(`/list/${selectedId}`);
    }

    return (
        <>
            <Title level={1}>
                필요 구호품 등록
            </Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleCancel}>취소</Button>
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: '#001f91' }}>등록</Button>
                    </Space>
                </Form.Item>

                <Space>
                    <Form.Item
                        label="필요 구호품"
                        name="name"
                        rules={[{ required: true, message: '구호품 이름을 입력해주세요' }]}
                        style={{paddingRight: '50px'}}
                    >
                        <Input placeholder="예: 생수" style={{width: "300px"}} />
                    </Form.Item>

                    <Form.Item
                        label="필요 수량"
                        name="targetStock"
                        rules={[{ required: true, message: '수량을 입력해주세요' }]}
                    >
                        <Input type="number" placeholder="예: 500" style={{width: "300px"}}  />
                    </Form.Item>
                </Space>
                <Form.Item
                    label="조건"
                    name="description"
                >
                    <Input />
                </Form.Item>
            </Form>

            <Card title="구호품 현황">
                <StatusList cnt={dummyData.length} data={dummyData} />
            </Card>
        </>
    )
}

export default AddProduct;