import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@cloud-materials/common";

const LoginForm: React.FC = () => {
    const { i18n, t } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;

    return (
        <>
            <Form.Item
                label={t("login.username")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
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
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
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
