
import { Typography, Button, Modal, Form, Input, Space, Row, Col, Alert, Tag } from 'antd';
import { CloseOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const Modify = ({ isModalOpen, closeModal, selectedItem, handleSubmit }) => {
    const [form] = Form.useForm();

    return (
        <Modal
            open={isModalOpen}
            title={
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    재고정보 수정
                </div>
            }
            onCancel={closeModal}
            closeIcon={<CloseOutlined style={{ fontSize: '14px' }} />}
            footer={[
                <Button key="cancel" onClick={closeModal}>
                    취소
                </Button>,
                <Button key="confirm" type="primary" onClick={()=>{}}>
                    저장
                </Button>,
            ]}
            width={640}
            styles={{
                header: { paddingBottom: '12px' },
                body: { paddingTop: '16px' }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="구호품명"
                    name="itemName"
                    rules={[{ required: true, message: "구호품명을 입력해주세요" }]}
                >
                    <Input value={selectedItem?.suppliesName} />
                </Form.Item>
                <Form.Item
                    label="현재 수량"
                    name="currentQuantity"
                    rules={[{ required: true, message: "현재수량을 입력해주세요" }]}
                >
                    <Input value={selectedItem?.currentQuantity} />
                </Form.Item>
                <Form.Item
                    label="예상 필요 수량"
                    name="expectedQuantity"
                    rules={[{ required: true, message: "예상 필요 수량을 입력해주세요" }]}
                >
                    <Input value={selectedItem?.expectedQuantity} />
                </Form.Item>
                <Form.Item
                    label="기준"
                    name="unit"
                    rules={[{ required: true, message: "단위를 입력해주세요" }]}
                >
                    <Input placeholder='단위를 입력해 주세요. (예: 개, ml 등)' />
                </Form.Item>
            </Form>
        </Modal>
    )
}