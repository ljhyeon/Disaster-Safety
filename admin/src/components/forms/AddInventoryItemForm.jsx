import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space } from 'antd';

const { Option } = Select;

const AddInventoryItemForm = ({ onSubmit, onCancel, categories, subcategories }) => {
    const [form] = Form.useForm();
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        form.setFieldsValue({ subcategory: undefined });
    };

    const handleSubmit = async (values) => {
        try {
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                current_quantity: 0,
                minimum_required: 0,
                unit: '개'
            }}
        >
            <Form.Item
                label="카테고리"
                name="category"
                rules={[{ required: true, message: '카테고리를 선택해주세요' }]}
            >
                <Select
                    placeholder="카테고리 선택"
                    onChange={handleCategoryChange}
                >
                    {Object.entries(categories).map(([key, value]) => (
                        <Option key={key} value={key}>{value}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="세부 카테고리"
                name="subcategory"
                rules={[{ required: true, message: '세부 카테고리를 선택해주세요' }]}
            >
                <Select
                    placeholder="세부 카테고리 선택"
                    disabled={!selectedCategory}
                >
                    {selectedCategory && subcategories[selectedCategory] &&
                        Object.entries(subcategories[selectedCategory]).map(([key, value]) => (
                            <Option key={key} value={key}>{value}</Option>
                        ))
                    }
                </Select>
            </Form.Item>

            <Form.Item
                label="물품명"
                name="item_name"
                rules={[{ required: true, message: '물품명을 입력해주세요' }]}
            >
                <Input placeholder="예: 생수 500ml" />
            </Form.Item>

            <Form.Item
                label="단위"
                name="unit"
                rules={[{ required: true, message: '단위를 입력해주세요' }]}
            >
                <Input placeholder="예: 개, 박스, kg" />
            </Form.Item>

            <Form.Item
                label="현재 수량"
                name="current_quantity"
                rules={[
                    { required: true, message: '현재 수량을 입력해주세요' },
                    { type: 'number', min: 0, message: '0 이상의 숫자를 입력해주세요' }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    placeholder="현재 보유 수량"
                    min={0}
                />
            </Form.Item>

            <Form.Item
                label="최소 필요 수량"
                name="minimum_required"
                rules={[
                    { required: true, message: '최소 필요 수량을 입력해주세요' },
                    { type: 'number', min: 0, message: '0 이상의 숫자를 입력해주세요' }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    placeholder="최소 필요 수량"
                    min={0}
                />
            </Form.Item>

            <Form.Item
                label="최대 보관 가능 수량 (선택)"
                name="maximum_capacity"
            >
                <InputNumber
                    style={{ width: '100%' }}
                    placeholder="최대 보관 가능 수량"
                    min={0}
                />
            </Form.Item>

            <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={onCancel}>
                        취소
                    </Button>
                    <Button type="primary" htmlType="submit">
                        추가
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default AddInventoryItemForm;