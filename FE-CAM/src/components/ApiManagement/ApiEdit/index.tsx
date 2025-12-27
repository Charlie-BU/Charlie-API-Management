import React, { useEffect, useState } from "react";
import {
    Button,
    Space,
    Typography,
    Divider,
    Form,
    Message,
} from "@cloud-materials/common";
import styles from "../index.module.less";
import BriefInfoEdit from "./BriefInfoEdit";
import ResponseParamsEdit from "./ResponseParamsEdit";
import RequestParamsEdit from "./RequestParamsEdit";
import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";

interface ApiEditProps {
    loading: boolean;
    apiDetail: ApiDetail | ApiDraftDetail;
    iterationId: number;
    onSuccess: () => void;
}

const ApiEdit: React.FC<ApiEditProps> = ({
    loading,
    apiDetail,
    iterationId,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [editLoading, setEditLoading] = useState(false);
    const [isDraft, setIsDraft] = useState(true);

    useEffect(() => {
        form.setFieldsValue(apiDetail);
        setIsDraft(true);
    }, [apiDetail, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            console.log("Form values:", values);
            // TODO: Call API update service here
            setIsDraft(false);
            Message.success("保存成功");
            onSuccess();
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    if (loading || !apiDetail) {
        return null;
    }

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <Typography.Title heading={5}>Service 迭代</Typography.Title>
                <Space>
                    <Button
                        type="default"
                        status="success"
                        onClick={handleSubmit}
                        loading={editLoading}
                        disabled={!isDraft}
                    >
                        {isDraft ? "保存当前 API" : "当前 API 已保存"}
                    </Button>
                </Space>
            </div>
            <Form
                form={form}
                layout="vertical"
                scrollToFirstError
                initialValues={apiDetail}
                onValuesChange={(_, allValues) => {
                    setIsDraft(true);
                    console.log("Form values:", allValues);
                }}
            >
                <BriefInfoEdit />
                <Divider />
                <RequestParamsEdit />
                <Divider />
                <ResponseParamsEdit />
            </Form>
        </div>
    );
};

export default ApiEdit;
