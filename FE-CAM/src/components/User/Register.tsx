import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Form,
    Input,
    Button,
    Space,
    Typography,
    Message,
    Select,
} from "@cloud-materials/common";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import type { RegisterRequest } from "@/services/user/types";

const Register: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { register } = useUser();

    const handleSubmit = async (formData: RegisterRequest & { confirmPassword: string }) => {
        try {
            await form.validate();
            setLoading(true);
            const res = await register({
                username: formData.username,
                password: formData.password,
                nickname: formData.nickname,
                email: formData.email,
                role: formData.role,
                confirmPassword: formData.confirmPassword,
            });
            Message.success(res.message || t("register.success"));
            navigate("/");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("register.failure");
            Message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 360,
                padding: "48px 24px",
            }}
        >
            <div style={{ marginBottom: 12 }}>
                <Typography.Title heading={5} style={{ margin: 0 }}>
                    {t("register.title")}
                </Typography.Title>
            </div>
            <Form form={form} layout="vertical" onSubmit={handleSubmit}>
                <Form.Item
                    label={t("register.username")}
                    field="username"
                    rules={[{ required: true, message: t("register.usernameRequired") }]}
                >
                    <Input placeholder={t("register.usernamePlaceholder")} allowClear />
                </Form.Item>
                <Form.Item
                    label={t("register.nickname")}
                    field="nickname"
                    rules={[{ required: true, message: t("register.nicknameRequired") }]}
                >
                    <Input placeholder={t("register.nicknamePlaceholder")} allowClear />
                </Form.Item>
                <Form.Item
                    label={t("register.email")}
                    field="email"
                    rules={[{ required: true, message: t("register.emailRequired") }]}
                >
                    <Input placeholder={t("register.emailPlaceholder")} allowClear />
                </Form.Item>
                <Form.Item
                    label={t("register.role")}
                    field="role"
                    rules={[{ required: true, message: t("register.roleRequired") }]}
                >
                    <Select placeholder={t("register.rolePlaceholder")}>
                        <Select.Option value="frontend">{t("user.frontend")}</Select.Option>
                        <Select.Option value="backend">{t("user.backend")}</Select.Option>
                        <Select.Option value="fullstack">{t("user.fullstack")}</Select.Option>
                        <Select.Option value="qa">{t("user.qa")}</Select.Option>
                        <Select.Option value="devops">{t("user.devops")}</Select.Option>
                        <Select.Option value="product_manager">{t("user.product_manager")}</Select.Option>
                        <Select.Option value="designer">{t("user.designer")}</Select.Option>
                        <Select.Option value="architect">{t("user.architect")}</Select.Option>
                        <Select.Option value="proj_lead">{t("user.proj_lead")}</Select.Option>
                        <Select.Option value="guest">{t("user.guest")}</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t("register.password")}
                    field="password"
                    rules={[{ required: true, message: t("register.passwordRequired") }]}
                >
                    <Input.Password placeholder={t("register.passwordPlaceholder")} allowClear />
                </Form.Item>
                <Form.Item
                    label={t("register.confirmPassword")}
                    field="confirmPassword"
                    rules={[{ required: true, message: t("register.confirmPasswordRequired") }]}
                >
                    <Input.Password placeholder={t("register.confirmPasswordPlaceholder")} allowClear />
                </Form.Item>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Button type="text" onClick={() => form.resetFields()}>
                        {t("register.reset")}
                    </Button>
                    <Button type="primary" loading={loading} htmlType="submit">
                        {t("register.submit")}
                    </Button>
                </Space>
            </Form>
        </div>
    );
};

export default Register;