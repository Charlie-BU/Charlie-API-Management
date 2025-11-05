import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Form,
    Input,
    Button,
    Space,
    Typography,
    Message,
} from "@cloud-materials/common";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

const Login: React.FC = () => {
    const { t } = useTranslation();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleSubmit = async () => {
        try {
            await form.validate();
            const values = form.getFieldsValue();
            setLoading(true);
            await login({
                username: values.username,
                password: values.password,
            });
            Message.success(t("login.success"));
            navigate("/");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("login.failure");
            Message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: 250, padding: "16px 12px" }}>
            <div style={{ marginBottom: 12 }}>
                <Typography.Title heading={5} style={{ margin: 0 }}>
                    {t("login.title")}
                </Typography.Title>
            </div>
            <Form form={form} layout="vertical">
                <Form.Item
                    label={t("login.username")}
                    field="username"
                    rules={[{ required: true, message: t("login.usernameRequired") }]}
                >
                    <Input placeholder={t("login.usernamePlaceholder")} allowClear />
                </Form.Item>
                <Form.Item
                    label={t("login.password")}
                    field="password"
                    rules={[{ required: true, message: t("login.passwordRequired") }]}
                >
                    <Input.Password placeholder={t("login.passwordPlaceholder")} allowClear />
                </Form.Item>
                <Space
                    style={{
                        width: "100%",
                        justifyContent: "space-between",
                    }}
                >
                    <Button type="text" onClick={() => form.resetFields()}>
                        {t("login.reset")}
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={handleSubmit}
                    >
                        {t("login.login")}
                    </Button>
                </Space>
            </Form>
        </div>
    );
};

export default Login;
