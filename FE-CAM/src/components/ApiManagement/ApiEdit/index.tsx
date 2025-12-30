import React, { useEffect, useState } from "react";
import {
    Button,
    Space,
    Typography,
    Divider,
    Form,
    Message,
} from "@cloud-materials/common";
import sharedStyles from "../index.module.less";
import BriefInfoEdit from "./BriefInfoEdit";
import {
    transformReqParamsToApiInput,
    transformRespParamsToApiInput,
} from "./utils";
import type {
    ApiDetail,
    ApiDraftDetail,
    ApiReqParamInput,
    ApiRespParamInput,
    UpdateApiByApiDraftIdRequest,
    UpdateApiByApiDraftIdResponse,
} from "@/services/api/types";
import RequestParamsEdit from "./RequestParamsEdit";
import ResponseParamsEdit from "./ResponseParamsEdit";

interface ApiEditProps {
    loading: boolean;
    apiDetail: ApiDetail | ApiDraftDetail;
    handleSaveApiDraft: (
        data: Omit<UpdateApiByApiDraftIdRequest, "service_iteration_id">
    ) => Promise<UpdateApiByApiDraftIdResponse>;
}

const ApiEdit: React.FC<ApiEditProps> = ({
    loading,
    apiDetail,
    handleSaveApiDraft,
}) => {
    const [form] = Form.useForm();
    const [editLoading, setEditLoading] = useState(false);
    const [isDraft, setIsDraft] = useState(false);

    useEffect(() => {
        form.setFieldsValue(apiDetail);
        setIsDraft(false);
    }, [apiDetail, form]);

    const handleSubmit = async () => {
        const values = await form.validate();
        setEditLoading(true);
        console.log("values", values);

        const req_params: ApiReqParamInput[] = transformReqParamsToApiInput(
            values.request_params_by_location
        );
        const resp_params: ApiRespParamInput[] = transformRespParamsToApiInput(
            values.response_params_by_status_code
        );
        const data: Omit<UpdateApiByApiDraftIdRequest, "service_iteration_id"> =
            {
                api_draft_id: apiDetail.id,
                name: values.name,
                method: values.method,
                path: values.path,
                description: values.description,
                level: apiDetail.level || "P2",
                req_params,
                resp_params,
            };
        console.log("data", data);
        try {
            const res = await handleSaveApiDraft(data);
            setIsDraft(false);
            Message.success(res.message || "API 保存成功");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "API 保存失败";
            Message.error(msg);
        }
        setEditLoading(false);
    };

    if (loading || !apiDetail) {
        return null;
    }

    return (
        <div className={sharedStyles.content}>
            <div className={sharedStyles.header}>
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
                onValuesChange={() => {
                    setIsDraft(true);
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
