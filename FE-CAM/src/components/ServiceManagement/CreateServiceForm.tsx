import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Form, Input, Popover } from "@cloud-materials/common";
import type { UserProfile } from "@/services/user/types";

const CreateServiceForm: React.FC<{ owner?: UserProfile }> = ({ owner }) => {
    const { i18n, t } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;

    return (
        <>
            <Form.Item
                label={t("service.serviceUUID")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
                field="service_uuid"
                rules={[
                    {
                        required: true,
                        message: t("service.serviceUUIDRequired"),
                    },
                    {
                        match: /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/,
                        message: t("service.serviceUUIDInvalid"),
                    }
                ]}
            >
                <Input
                    placeholder={t("service.serviceUUIDPlaceholder")}
                    allowClear
                />
            </Form.Item>
            <Form.Item
                label={t("service.initVersion")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input value={"0.0.1"} disabled />
            </Form.Item>
            <Form.Item
                label={t("service.ownerName")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Popover
                    content={`${owner?.nickname} (${owner?.username}) - ${owner?.email}`}
                >
                    <Avatar size={30} style={{ backgroundColor: "#ecf2ff" }}>
                        {owner?.nickname?.[0] || owner?.username?.[0] || "-"}
                    </Avatar>
                </Popover>
                {/* <Input value={t("service.ownerName")} disabled /> */}
            </Form.Item>
            <Form.Item
                label={t("service.description")}
                labelCol={currentLanguage === "en-US" ? { span: 7 } : undefined}
                wrapperCol={
                    currentLanguage === "en-US" ? { span: 17 } : undefined
                }
                field="description"
                rules={[
                    {
                        required: true,
                        message: t("service.descriptionRequired"),
                    },
                ]}
            >
                <Input.TextArea
                    placeholder={t("service.descriptionPlaceholder")}
                    allowClear
                />
            </Form.Item>
        </>
    );
};

export default CreateServiceForm;
