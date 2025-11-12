import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Select } from "@cloud-materials/common";

const RegisterForm: React.FC = () => {
    const { i18n, t } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;

    return (
        <>
            <Form.Item
                label={t("register.username")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}
                field="username"
                rules={[
                    { required: true, message: t("register.usernameRequired") },
                ]}
            >
                <Input
                    placeholder={t("register.usernamePlaceholder")}
                    allowClear
                />
            </Form.Item>
            <Form.Item
                label={t("register.nickname")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}
                field="nickname"
                rules={[
                    { required: true, message: t("register.nicknameRequired") },
                ]}
            >
                <Input
                    placeholder={t("register.nicknamePlaceholder")}
                    allowClear
                />
            </Form.Item>
            <Form.Item
                label={t("register.email")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}   
                field="email"
                rules={[
                    { required: true, message: t("register.emailRequired") },
                ]}
            >
                <Input
                    placeholder={t("register.emailPlaceholder")}
                    allowClear
                />
            </Form.Item>
            <Form.Item
                label={t("register.role")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}   
                field="role"
                rules={[
                    { required: true, message: t("register.roleRequired") },
                ]}
            >
                <Select placeholder={t("register.rolePlaceholder")}>
                    <Select.Option value="frontend">
                        {t("user.frontend")}
                    </Select.Option>
                    <Select.Option value="backend">
                        {t("user.backend")}
                    </Select.Option>
                    <Select.Option value="fullstack">
                        {t("user.fullstack")}
                    </Select.Option>
                    <Select.Option value="qa">{t("user.qa")}</Select.Option>
                    <Select.Option value="devops">
                        {t("user.devops")}
                    </Select.Option>
                    <Select.Option value="product_manager">
                        {t("user.product_manager")}
                    </Select.Option>
                    <Select.Option value="designer">
                        {t("user.designer")}
                    </Select.Option>
                    <Select.Option value="architect">
                        {t("user.architect")}
                    </Select.Option>
                    <Select.Option value="proj_lead">
                        {t("user.proj_lead")}
                    </Select.Option>
                    <Select.Option value="guest">
                        {t("user.guest")}
                    </Select.Option>
                </Select>
            </Form.Item>
            <Form.Item
                label={t("register.password")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}   
                field="password"
                rules={[
                    { required: true, message: t("register.passwordRequired") },
                ]}
            >
                <Input.Password
                    placeholder={t("register.passwordPlaceholder")}
                    allowClear
                />
            </Form.Item>
            <Form.Item
                label={t("register.confirmPassword")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}   
                field="confirmPassword"
                rules={[
                    {
                        required: true,
                        message: t("register.confirmPasswordRequired"),
                    },
                ]}
            >
                <Input.Password
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    allowClear
                />
            </Form.Item>
        </>
    );
};

export default RegisterForm;
