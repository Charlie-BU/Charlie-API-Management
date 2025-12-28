import { useMemo } from "react";
import { IconCommon, Space, Tabs } from "@cloud-materials/common";
import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";
import ParamTable from "./ParamTable";

const RequestParamsEdit = (props: {
    apiDetail: ApiDetail | ApiDraftDetail;
}) => {
    const { apiDetail } = props;
    const requestParamsByLocation = useMemo(
        () => apiDetail?.request_params_by_location,
        [apiDetail]
    );

    return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>

            <Tabs defaultActiveTab="query">
                <Tabs.TabPane key="query" title="Query 参数">
                    <ParamTable
                        name="req_params_query"
                        paramList={requestParamsByLocation?.query || []}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane key="path" title="Path 参数">
                    <ParamTable
                        name="req_params_path"
                        paramList={requestParamsByLocation?.path || []}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane key="body" title="Body 参数">
                    <ParamTable
                        name="req_params_body"
                        paramList={requestParamsByLocation?.body || []}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane key="header" title="Header 参数">
                    <ParamTable
                        name="req_params_header"
                        paramList={requestParamsByLocation?.header || []}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane key="cookie" title="Cookie 参数">
                    <ParamTable
                        name="req_params_cookie"
                        paramList={requestParamsByLocation?.cookie || []}
                    />
                </Tabs.TabPane>
            </Tabs>
        </Space>
    );
};

export default RequestParamsEdit;
