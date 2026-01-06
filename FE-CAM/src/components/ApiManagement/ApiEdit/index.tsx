import React, { useEffect, useState } from "react";
import {
    Button,
    Space,
    Typography,
    Divider,
    Form,
    Message,
    Spin,
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
    ParamLocation,
    UpdateApiByApiDraftIdRequest,
    UpdateApiByApiDraftIdResponse,
} from "@/services/api/types";
import RequestParamsEdit from "./RequestParamsEdit";
import ResponseParamsEdit from "./ResponseParamsEdit";

// 把请求参数tabs相关逻辑提到本层，便于根据apiDetail处理首个activeTab
export const tabs = [
    { key: "query", title: "Query 参数" },
    { key: "path", title: "Path 参数" },
    { key: "body", title: "Body 参数" },
    { key: "header", title: "Header 参数" },
    { key: "cookie", title: "Cookie 参数" },
];

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
    const [reqParamsActiveTab, setReqParamsActiveTab] = useState("query");

    const getFirstTabWithValue = () => {
        if (!apiDetail.request_params_by_location) {
            return "query";
        }
        for (const tab of tabs) {
            if (
                apiDetail.request_params_by_location[tab.key as ParamLocation]
                    .length > 0
            ) {
                return tab.key;
            }
        }
        return "query";
    };

    useEffect(() => {
        form.setFieldsValue(apiDetail);
        setIsDraft(false);
        setReqParamsActiveTab(getFirstTabWithValue());
    }, [apiDetail, form]);

    // 提交本次apiDraft改动
    const handleSubmit = async () => {
        const values = await form.validate();
        setEditLoading(true);

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

    return (
        <div className={sharedStyles.content}>
            <Spin size={40} loading={loading}>
                <div className={sharedStyles.header}>
                    <Typography.Title heading={5}>
                        Service 迭代
                    </Typography.Title>
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
                    <RequestParamsEdit
                        reqParamsActiveTab={reqParamsActiveTab}
                        setReqParamsActiveTab={setReqParamsActiveTab}
                    />
                    <Divider />
                    <ResponseParamsEdit />
                </Form>
            </Spin>
        </div>
    );
};

export default ApiEdit;
