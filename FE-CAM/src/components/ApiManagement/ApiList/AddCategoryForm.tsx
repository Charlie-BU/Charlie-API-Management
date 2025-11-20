import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@cloud-materials/common";

const AddCategoryForm: React.FC = () => {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;

    return (
        <>
            <Form.Item
                label="分类名"
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
                field="category_name"
                rules={[
                    {
                        required: true,
                        message: "请输入分类名",
                    },
                ]}
            >
                <Input placeholder="请输入分类名" allowClear />
            </Form.Item>
            <Form.Item
                label="分类描述"
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
                field="description"
                rules={[
                    {
                        required: true,
                        message: "请输入分类描述",
                    },
                ]}
            >
                <Input.TextArea placeholder="请输入分类描述" allowClear />
            </Form.Item>
        </>
    );
};

export default AddCategoryForm;
