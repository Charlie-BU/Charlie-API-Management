import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@cloud-materials/common";

const CreateServiceForm: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Form.Item
                label={t("service.serviceUUID")}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
                field="service_uuid"
                rules={[
                    {
                        required: true,
                        message: t("service.serviceUUIDRequired"),
                    },
                ]}
            >
                <Input
                    placeholder={t("service.serviceUUIDPlaceholder")}
                    allowClear
                />
            </Form.Item>
            <Form.Item
                label={t("service.initVersion")}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
                 rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input
                placeholder={t("service.initVersion")}
                disabled
            />
            </Form.Item>
            <Form.Item
                label={t("service.ownerName")}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
                 rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input
                placeholder={t("service.ownerName")}
                disabled
            />
            </Form.Item>
            <Form.Item
                label={t("service.description")}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
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
