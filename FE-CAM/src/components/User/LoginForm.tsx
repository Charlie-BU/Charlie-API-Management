import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@cloud-materials/common";

const LoginForm: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
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
        </>
    );
};

export default LoginForm;
