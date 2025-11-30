import React from "react";
import {
    Input,
    Select,
    Switch,
    Form,
    Grid,
    Space,
    IconCommon,
} from "@cloud-materials/common";

const { Row, Col } = Grid;
const { TextArea } = Input;

const BriefInfoEdit: React.FC = () => {
    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 接口信息
            </div>
            <Row gutter={24}>
                <Col span={24}>
                    <Form.Item
                        label="接口名称释义"
                        field="name"
                        rules={[{ required: true, message: '请输入接口名称' }]}
                    >
                        <Input placeholder="请输入接口名称" maxLength={50} showWordLimit />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label="接口方法与路径" required>
                        <Space direction="horizontal" size={0} style={{ width: '100%' }}>
                            <Form.Item
                                field="method"
                                rules={[{ required: true, message: '请选择方法' }]}
                                noStyle
                            >
                                <Select
                                    style={{ width: 120 }}
                                    placeholder="Method"
                                    options={[
                                        { label: 'GET', value: 'GET' },
                                        { label: 'POST', value: 'POST' },
                                        { label: 'PUT', value: 'PUT' },
                                        { label: 'DELETE', value: 'DELETE' },
                                        { label: 'PATCH', value: 'PATCH' },
                                    ]}
                                />
                            </Form.Item>
                            <div style={{ padding: '0 8px', color: 'var(--color-text-3)' }}>/</div>
                            <Form.Item
                                field="path"
                                rules={[{ required: true, message: '请输入路径' }]}
                                noStyle
                            >
                                <Input placeholder="api/login" style={{ flex: 1 }} />
                            </Form.Item>
                        </Space>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label="接口描述" field="description">
                        <TextArea
                            placeholder="请输入接口信息"
                            maxLength={200}
                            showWordLimit
                            autoSize={{ minRows: 3, maxRows: 5 }}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Space>
    );
};

export default BriefInfoEdit;
