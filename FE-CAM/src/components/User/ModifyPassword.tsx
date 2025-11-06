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
import { useUser } from "@/hooks/useUser";
import type { ModifyPasswordRequest } from "@/services/user/types";
import { useNavigate } from "react-router-dom";

const ModifyPassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
        
    const { modifyPassword } = useUser();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: ModifyPasswordRequest & { confirm_new_password: string }) => {
        try {
            await form.validate();
            setLoading(true);
            const res = await modifyPassword(formData);
            if (res.status !== 200) {
                throw new Error(res.message || "修改密码失败");
            }
            Message.success(t("modifyPassword.success"));
            navigate("/");
        } catch (error: unknown) {
            const msg =
                error instanceof Error
                    ? error.message
                    : t("modifyPassword.failure");
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
                padding: "24px 24px",
            }}
        >
            <div style={{ marginBottom: 12 }}>
                <Typography.Title heading={5} style={{ margin: 0 }}>
                    {t("modifyPassword.title")}
                </Typography.Title>
            </div>
            <Form form={form} layout="vertical" onSubmit={handleSubmit}>
                <Form.Item
                    label={t("modifyPassword.oldPassword")}
                    field="old_password"
                    rules={[
                        {
                            required: true,
                            message: t("modifyPassword.oldPasswordRequired"),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t("modifyPassword.oldPasswordPlaceholder")}
                        allowClear
                    />
                </Form.Item>
                <Form.Item
                    label={t("modifyPassword.newPassword")}
                    field="new_password"
                    rules={[
                        {
                            required: true,
                            message: t("modifyPassword.newPasswordRequired"),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t("modifyPassword.newPasswordPlaceholder")}
                        allowClear
                    />
                </Form.Item>
                <Form.Item
                    label={t("modifyPassword.confirmPassword")}
                    field="confirm_new_password"
                    rules={[
                        {
                            required: true,
                            message: t(
                                "modifyPassword.confirmPasswordRequired"
                            ),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t(
                            "modifyPassword.confirmPasswordPlaceholder"
                        )}
                        allowClear
                    />
                </Form.Item>
                <Space
                    style={{
                        width: "100%",
                        justifyContent: "space-between",
                    }}
                >
                    <Button type="primary" loading={loading} htmlType="submit">
                        {t("modifyPassword.submit")}
                    </Button>
                </Space>
            </Form>
        </div>
    );
};

export default ModifyPassword;
