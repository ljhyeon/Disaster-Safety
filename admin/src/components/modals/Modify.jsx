
import { useEffect } from 'react';
import { Typography, Button, Modal, Form, InputNumber, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const Modify = ({ isModalOpen, closeModal, selectedItem, handleSubmit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (selectedItem && isModalOpen) {
            form.setFieldsValue({
                itemName: selectedItem.suppliesName,
                currentQuantity: selectedItem.currentQuantity,
                expectedQuantity: selectedItem.expectedQuantity,
                unit: selectedItem.unit,
                maximum_capacity: selectedItem.maximum_capacity
            });
        }
    }, [selectedItem, isModalOpen, form]);

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
                <Button key="confirm" type="primary" onClick={() => form.submit()}>
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
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label="현재 수량"
                    name="currentQuantity"
                    rules={[
                        { required: true, message: "현재 수량을 입력해주세요" },
                        { type: 'number', min: 0, message: '0 이상의 숫자를 입력해주세요' }
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
                <Form.Item
                    label="최소 필요 수량"
                    name="expectedQuantity"
                    rules={[
                        { required: true, message: "최소 필요 수량을 입력해주세요" },
                        { type: 'number', min: 0, message: '0 이상의 숫자를 입력해주세요' }
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
                <Form.Item
                    label="단위"
                    name="unit"
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label="최대 보관 가능 수량 (선택)"
                    name="maximum_capacity"
                >
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="최대 보관 가능 수량" />
                </Form.Item>
            </Form>
        </Modal>
    )
}