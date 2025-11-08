import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@cloud-materials/common";

const ModifyPasswordForm: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Form.Item
                label={t("modifyPassword.oldPassword")}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
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
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
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
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
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
