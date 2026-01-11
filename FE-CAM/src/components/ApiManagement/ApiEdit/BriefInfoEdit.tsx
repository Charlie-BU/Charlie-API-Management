import React, { useState } from "react";
import {
    Input,
    Select,
    Form,
    Space,
    IconCommon,
} from "@cloud-materials/common";
import { HTTP_METHODS } from "./types";

const { TextArea } = Input;

const BriefInfoEdit: React.FC = () => {
    // 仅用作path placeholder
    const { form } = Form.useFormContext();
    const [name, setName] = useState(form.getFieldValue("name"));

    return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 接口信息
            </div>
            <div style={{ width: "100%" }}>
                <Form.Item
                    label="API 名称"
                    field="name"
                    rules={[
                        { required: true, message: "请输入 API 名称" },
                        {
                            match: /^[^\u4e00-\u9fff]*$/,
                            message: "API 名称不能包含中文",
                        },
                    ]}
                    style={{ width: "50%" }}
                >
                    <Input
                        placeholder="请输入 API 名称"
                        maxLength={50}
                        showWordLimit
                        onChange={(value: string) => {
                            setName(value);
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="请求方法与路径"
                    required
                    style={{ width: "50%" }}
                >
                    <Space direction="horizontal" style={{ width: "100%" }}>
                        <Form.Item
                            field="method"
                            rules={[
                                { required: true, message: "请选择请求方法" },
                            ]}
                            noStyle={{ showErrorTip: true }}
                        >
                            <Select style={{ width: 120 }} placeholder="Method">
                                {HTTP_METHODS.map((method) => (
                                    <Select.Option key={method} value={method}>
                                        {method}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            field="path"
                            rules={[
                                { required: true, message: "请输入API路径" },
                                { match: /^\//, message: "路径必须以 / 开头" },
                                {
                                    match: /^[^\u4e00-\u9fff]*$/,
                                    message: "路径不能包含中文",
                                },
                            ]}
                            noStyle={{ showErrorTip: true }}
                        >
                            <Input
                                placeholder={`/api/${name}`}
                                style={{ flex: 1 }}
                            />
                        </Form.Item>
                    </Space>
                </Form.Item>
                <Form.Item
                    label="接口等级"
                    field="level"
                    rules={[{ required: true, message: "请选择接口等级" }]}
                    style={{ width: "50%" }}
                >
                    <Select placeholder="请选择接口等级">
                        {["P0", "P1", "P2", "P3", "P4"].map((l) => (
                            <Select.Option key={l} value={l}>
                                {l}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="接口描述"
                    field="description"
                    style={{ width: "50%" }}
                >
                    <TextArea
                        placeholder="请输入接口描述"
                        maxLength={200}
                        showWordLimit
                        autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                </Form.Item>
            </div>
        </Space>
    );
};

export default BriefInfoEdit;
