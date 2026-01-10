import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Select } from "@cloud-materials/common";
import type { ApiCategory } from "@/services/service/types";
import { HTTP_METHODS } from "../ApiEdit/types";

interface AddApiFormProps {
    apiCategories?: ApiCategory[];
}

const AddApiForm: React.FC<AddApiFormProps> = ({ apiCategories = [] }) => {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;

    const formItemLayout = {
        labelCol: currentLanguage === "en-US" ? { span: 7 } : undefined,
        wrapperCol: currentLanguage === "en-US" ? { span: 17 } : undefined,
    };

    const categories = [...apiCategories, { id: -1, name: "未分类" }];
    const [name, setName] = useState("");

    return (
        <>
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
                {...formItemLayout}
            >
                <Input
                    placeholder="请输入 API 名称"
                    allowClear
                    onChange={setName}
                />
            </Form.Item>
            <Form.Item
                label="请求方法"
                field="method"
                initialValue="GET"
                rules={[{ required: true, message: "请选择请求方法" }]}
                {...formItemLayout}
            >
                <Select placeholder="请选择请求方法">
                    {HTTP_METHODS.map((m) => (
                        <Select.Option key={m} value={m}>
                            {m}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                label="API 路径"
                field="path"
                rules={[
                    { required: true, message: "请输入 API 路径" },
                    { match: /^\//, message: "路径必须以 / 开头" },
                    {
                        match: /^[^\u4e00-\u9fff]*$/,
                        message: "API 路径不能包含中文",
                    },
                ]}
                {...formItemLayout}
            >
                <Input placeholder={`/api/${name}`} allowClear />
            </Form.Item>
            <Form.Item
                label="接口等级"
                field="level"
                initialValue="P2"
                rules={[{ required: true, message: "请选择接口等级" }]}
                {...formItemLayout}
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
                label="所属分类"
                field="category_id"
                initialValue={-1}
                rules={[{ required: true, message: "请选择所属分类" }]}
                {...formItemLayout}
            >
                <Select placeholder="请选择分类">
                    {categories.map((c) => (
                        <Select.Option key={c.id} value={c.id}>
                            {c.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item label="接口描述" field="description" {...formItemLayout}>
                <Input.TextArea placeholder="请输入接口描述" allowClear />
            </Form.Item>
        </>
    );
};

export default AddApiForm;
