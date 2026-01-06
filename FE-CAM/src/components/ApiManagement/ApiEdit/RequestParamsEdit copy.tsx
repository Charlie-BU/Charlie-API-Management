import { useState, useEffect } from "react";
import { IconCommon, Space, Tabs, Form } from "@cloud-materials/common";
import ParamTable from "./ParamTable";
import type {
    ParamLocation,
    RequestParam,
    RequestParamDraft,
} from "@/services/api/types";

const tabs = [
    { key: "query", title: "Query 参数" },
    { key: "path", title: "Path 参数" },
    { key: "body", title: "Body 参数" },
    { key: "header", title: "Header 参数" },
    { key: "cookie", title: "Cookie 参数" },
];

const RequestParamsEdit = () => {
    const requestParamsByLocation: Record<
        ParamLocation,
        RequestParam[] | RequestParamDraft[]
    > = Form.useWatch("request_params_by_location") || {};

    const getFirstTabWithValue = () => {
        for (const tab of tabs) {
            if ((requestParamsByLocation[tab.key as ParamLocation]?.length || 0) > 0) {
                return tab.key;
            }
        }
        return "query";
    };

    const [activeTab, setActiveTab] = useState(getFirstTabWithValue());
    const [hasAutoSwitched, setHasAutoSwitched] = useState(false);

    useEffect(() => {
        if (hasAutoSwitched) return;
        const hasData = tabs.some(
            (tab) =>
                (requestParamsByLocation[tab.key as ParamLocation]?.length || 0) > 0
        );

        if (hasData) {
            setActiveTab(getFirstTabWithValue());
            setHasAutoSwitched(true);
        }
    }, [requestParamsByLocation, hasAutoSwitched]);

    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                {tabs.map((tab) => (
                    <Tabs.TabPane key={tab.key} title={tab.title} />
                ))}
            </Tabs>

            <div>
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        style={{
                            display: activeTab === tab.key ? "block" : "none",
                        }}
                    >
                        <Form.Item
                            field={`request_params_by_location.${tab.key}`}
                            triggerPropName="value"
                            noStyle
                        >
                            <ParamTable type="request" />
                        </Form.Item>
                    </div>
                ))}
            </div>
        </Space>
    );
};

export default RequestParamsEdit;
