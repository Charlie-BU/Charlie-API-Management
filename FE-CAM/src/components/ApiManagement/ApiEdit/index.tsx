import React, { useState } from "react";
import {
    Button,
    Space,
    Typography,
    Divider,
    Form,
    Message,
} from "@cloud-materials/common";
import styles from "../index.module.less";
import BriefInfoEdit from "./BriefInfoEdit";
import ResponseParamsEdit from "./ResponseParamsEdit";
import RequestParamsEdit from "./RequestParamsEdit";

const ApiEdit: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            console.log("Form values:", values);
            Message.success("保存成功");
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <Typography.Title heading={5}>编辑接口</Typography.Title>
                <Space>
                    <Button type="secondary">取消</Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        保存
                    </Button>
                </Space>
            </div>
            <Form form={form} layout="vertical" scrollToFirstError>
                <BriefInfoEdit />
                <Divider />
                <RequestParamsEdit />
                <Divider />
                <ResponseParamsEdit />
            </Form>
        </div>
    );
};

export default ApiEdit;
