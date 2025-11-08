import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@cloud-materials/common";

const ModifyPasswordForm: React.FC = () => {
    const { t } = useTranslation();

    // const handleSubmit = async (formData: ModifyPasswordRequest & { confirm_new_password: string }) => {
    //     try {
    //         await form.validate();
    //         setLoading(true);
    //         const res = await modifyPassword(formData);
    //         if (res.status !== 200) {
    //             throw new Error(res.message || "修改密码失败");
    //         }
    //         Message.success(t("modifyPassword.success"));
    //         navigate("/");
    //     } catch (error: unknown) {
    //         const msg =
    //             error instanceof Error
    //                 ? error.message
    //                 : t("modifyPassword.failure");
    //         Message.error(msg);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <>
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
