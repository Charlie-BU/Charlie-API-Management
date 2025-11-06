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
import type { LoginRequest } from "@/services/user/types";

const Login: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { login } = useUser();

    const handleSubmit = async (formData: LoginRequest) => {
        try {
            await form.validate();
            setLoading(true);
            const res = await login({
                username: formData.username,
                password: formData.password,
            });
            // 组件层负责提示
            Message.success(res.message || t("login.success"));
            navigate("/");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("login.failure");
            Message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: 250, padding: "12px 12px" }}>
            <div style={{ marginBottom: 12 }}>
                <Typography.Title heading={5} style={{ margin: 0 }}>
                    {t("login.title")}
                </Typography.Title>
            </div>
            <Form form={form} layout="vertical" onSubmit={handleSubmit}>
                <Form.Item
                    label={t("login.username")}
                    field="username"
                    rules={[
                        {
                            required: true,
                            message: t("login.usernameRequired"),
                        },
                    ]}
                >
                    <Input
                        placeholder={t("login.usernamePlaceholder")}
                        allowClear
                    />
                </Form.Item>
                <Form.Item
                    label={t("login.password")}
                    field="password"
                    rules={[
                        {
                            required: true,
                            message: t("login.passwordRequired"),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t("login.passwordPlaceholder")}
                        allowClear
                    />
                </Form.Item>
                <Space
                    style={{
                        width: "100%",
                        justifyContent: "space-between",
                    }}
                >
                    <Button
                        type="text"
                        onClick={() => navigate("/user/register")}
                    >
                        {t("login.gotoRegister")}
                    </Button>
                    <Button type="primary" loading={loading} htmlType="submit">
                        {t("login.login")}
                    </Button>
                </Space>
            </Form>
        </div>
    );
};

export default Login;
