import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@cloud-materials/common";

const ModifyPasswordForm: React.FC = () => {
    const { i18n, t } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;

    return (
        <>
            <Form.Item
                label={t("modifyPassword.oldPassword")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}
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
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}
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
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={currentLanguage === "en-US" ? { span: 17 } : undefined}
                field="confirm_new_password"
                rules={[
                    {
                        required: true,
                        message: t("modifyPassword.confirmPasswordRequired"),
                    },
                ]}
            >
                <Input.Password
                    placeholder={t("modifyPassword.confirmPasswordPlaceholder")}
                    allowClear
                />
            </Form.Item>
        </>
    );
};

export default ModifyPasswordForm;
